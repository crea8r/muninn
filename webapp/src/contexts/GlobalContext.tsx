import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import { OrgMember } from 'src/types/Org';
import { ObjectType, Tag, Funnel } from 'src/types';
import authService from 'src/services/authService';
import { personalSummarize, listOrgMembers } from 'src/api';
import { listObjectTypes } from 'src/api/objType';
import { getTag, listTags } from 'src/api/tag';
import { fetchAllFunnels } from 'src/api/funnel';
import { PersonalSummarize } from 'src/types/Summarize';

export const STORAGE_KEYS = {
  CACHE_VERSION: 'globalData_version',
  MEMBERS: 'globalData_members',
  OBJECT_TYPES: 'globalData_objectTypes',
  TAGS: 'globalData_tags',
  FUNNELS: 'globalData_funnels',
  PER_PAGE: 'globalData_perPage',
} as const;

const CACHE_VERSION = '1.0'; // Increment this when data structure changes
// Cache duration increased to 10 minutes
const CACHE_DURATION = 10 * 60 * 1000;
// Summary refresh interval remains at 1 minute
const SUMMARY_REFRESH_INTERVAL = 60 * 1000;

const storage = {
  isValid: () => {
    try {
      const version = localStorage.getItem(STORAGE_KEYS.CACHE_VERSION);
      return version === CACHE_VERSION;
    } catch {
      return false;
    }
  },

  getData: <T,>(key: string): { data: T; lastUpdated: number } | null => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item);
    } catch {
      return null;
    }
  },

  setData: <T,>(key: string, data: T) => {
    try {
      localStorage.setItem(
        key,
        JSON.stringify({
          data,
          lastUpdated: Date.now(),
        })
      );
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },

  clearAll: () => {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  },

  initialize: () => {
    try {
      localStorage.setItem(STORAGE_KEYS.CACHE_VERSION, CACHE_VERSION);
    } catch (error) {
      console.warn('Failed to initialize localStorage:', error);
    }
  },
};

// Define separate interfaces for each data type to make the code more maintainable
interface MemberData {
  members: OrgMember[];
  lastUpdated: number;
}

interface ObjectTypeData {
  objectTypes: ObjectType[];
  lastUpdated: number;
}

interface TagData {
  tags: Tag[];
  lastUpdated: number;
}

interface FunnelData {
  funnels: Funnel[];
  lastUpdated: number;
}

interface SummaryData {
  unseenFeedsCount: number;
  tasksCount: number;
  lastUpdated: number;
}

interface GlobalData {
  memberData: MemberData | null;
  objectTypeData: ObjectTypeData | null;
  tagData: TagData | null;
  funnelData: FunnelData | null;
  summaryData: SummaryData | null;
  perPage: number;
}

// Define the context type with separate refresh functions
interface GlobalContextType {
  globalData: GlobalData | null;
  refreshMembers: () => Promise<void>;
  refreshObjectTypes: () => Promise<void>;
  refreshTags: () => Promise<void>;
  fetchTag: (tagId: string) => Promise<void>;
  refreshFunnels: () => Promise<void>;
  refreshSummary: () => Promise<void>;
  refreshAll: () => Promise<void>;
  setGlobalPerPage: (perPage: number) => void;
  getTagsMeta: (tagIds: string[]) => Promise<Tag[]>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [globalData, setGlobalData] = useState<GlobalData | null>(null);
  const [initialized, setInitialized] = useState(false);

  const isCacheStale = useCallback((lastUpdated: number | undefined) => {
    if (!lastUpdated) return true;
    return Date.now() - lastUpdated > CACHE_DURATION;
  }, []);

  const loadFromStorage = useCallback(() => {
    if (!storage.isValid()) {
      storage.clearAll();
      storage.initialize();
      return null;
    }

    return {
      memberData: storage.getData<MemberData>(STORAGE_KEYS.MEMBERS),
      objectTypeData: storage.getData<ObjectTypeData>(
        STORAGE_KEYS.OBJECT_TYPES
      ),
      tagData: storage.getData<TagData>(STORAGE_KEYS.TAGS),
      funnelData: storage.getData<FunnelData>(STORAGE_KEYS.FUNNELS),
      perPage: parseInt(localStorage.getItem(STORAGE_KEYS.PER_PAGE) || '5'),
    };
  }, []);

  const refreshMembers = useCallback(async (force: boolean = false) => {
    try {
      const members = await listOrgMembers();
      const newData = {
        members,
        lastUpdated: Date.now(),
      };

      storage.setData(STORAGE_KEYS.MEMBERS, newData);
      setGlobalData((prev) => ({
        ...prev!,
        memberData: newData,
      }));
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  }, []);

  const refreshObjectTypes = useCallback(async (force: boolean = false) => {
    try {
      const response = await listObjectTypes({ page: 1, pageSize: 100 });
      const newData = {
        objectTypes: response.objectTypes,
        lastUpdated: Date.now(),
      };

      storage.setData(STORAGE_KEYS.OBJECT_TYPES, newData);
      setGlobalData((prev) => ({
        ...prev!,
        objectTypeData: newData,
      }));
    } catch (error) {
      console.error('Failed to fetch object types:', error);
    }
  }, []);

  const fetchTag = useCallback(
    async (tagId: string) => {
      try {
        const response = await getTag(tagId);
        const newTag = {
          id: response.id,
          name: response.name,
          description: response.description,
          color_schema: response.color_schema,
        };
        const newData = {
          tags: [...(globalData?.tagData?.tags || []), newTag],
          lastUpdated: Date.now(),
        };

        storage.setData(STORAGE_KEYS.TAGS, newData);
        setGlobalData((prev) => ({
          ...prev!,
          tagData: newData,
        }));
      } catch (error) {
        console.error('Failed to add tag:', error);
      }
    },
    [globalData?.tagData?.tags]
  );

  const refreshTags = useCallback(
    async (force: boolean = false) => {
      try {
        const response = await listTags({ page: 1, pageSize: 100 });
        const newData = {
          tags: response.tags,
          lastUpdated: Date.now(),
        };
        // combine newData.tags with existing tags, removing duplicates
        const existingTags = globalData?.tagData?.tags || [];
        const newTagIds = new Set(newData.tags.map((tag) => tag.id));
        const newDataTags = [
          ...existingTags.filter((tag) => !newTagIds.has(tag.id)),
          ...newData.tags,
        ];
        newData.tags = newDataTags;
        storage.setData(STORAGE_KEYS.TAGS, newData);
        setGlobalData((prev) => ({
          ...prev!,
          tagData: newData,
        }));
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      }
    },
    [globalData?.tagData?.tags]
  );

  const refreshFunnels = useCallback(async (force: boolean = false) => {
    try {
      const response = await fetchAllFunnels(1, 100);
      const newData = {
        funnels: response.funnels,
        lastUpdated: Date.now(),
      };

      storage.setData(STORAGE_KEYS.FUNNELS, newData);
      setGlobalData((prev) => ({
        ...prev!,
        funnelData: newData,
      }));
    } catch (error) {
      console.error('Failed to fetch funnels:', error);
    }
  }, []);

  const refreshSummary = useCallback(async () => {
    try {
      const pS: PersonalSummarize = await personalSummarize();
      setGlobalData((prev) => ({
        ...prev!,
        summaryData: {
          unseenFeedsCount: pS.unseen,
          tasksCount: pS.ongoingTask,
          lastUpdated: Date.now(),
        },
      }));
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    if (!authService.isAuthenticated()) return;

    await Promise.all([
      refreshMembers(),
      refreshObjectTypes(),
      refreshTags(),
      refreshFunnels(),
      refreshSummary(),
    ]);
  }, [
    refreshMembers,
    refreshObjectTypes,
    refreshTags,
    refreshFunnels,
    refreshSummary,
  ]);

  const setGlobalPerPage = useCallback((perPage: number) => {
    localStorage.setItem(STORAGE_KEYS.PER_PAGE, perPage.toString());
    setGlobalData((prev) => (prev ? { ...prev, perPage } : null));
  }, []);

  const getTagsMeta = useCallback(
    async (tagIds: string[]) => {
      const existingTags =
        (globalData?.tagData?.tags || []).filter((tag) =>
          tagIds.includes(tag.id)
        ) || [];

      const missingTagIds =
        tagIds.filter(
          (tagId) => !globalData?.tagData?.tags?.find((tag) => tag.id === tagId)
        ) || [];
      // loop through missing tags and fetch them
      const newTags = [];
      for (var i = 0; i < missingTagIds.length; i++) {
        const tagId = missingTagIds[i];
        const response = await getTag(tagId);
        const newTag = {
          id: response.id,
          name: response.name,
          description: response.description,
          color_schema: response.color_schema,
        };
        newTags.push(newTag);
      }

      const newData = {
        tags: [...(globalData?.tagData?.tags || []), ...newTags],
        lastUpdated: Date.now(),
      };

      storage.setData(STORAGE_KEYS.TAGS, newData);
      setGlobalData((prev) => ({
        ...prev!,
        tagData: newData,
      }));
      const result = [...existingTags, ...newTags];
      return result;
    },
    [globalData?.tagData?.tags]
  );

  // Initialize data from storage or fetch fresh data
  useEffect(() => {
    const initializeData = async () => {
      if (authService.isAuthenticated() && !initialized) {
        const storedData = loadFromStorage();

        // Initialize with stored data first
        setGlobalData({
          memberData: storedData?.memberData?.data ?? null,
          objectTypeData: storedData?.objectTypeData?.data ?? null,
          tagData: storedData?.tagData?.data ?? null,
          funnelData: storedData?.funnelData?.data ?? null,
          summaryData: null,
          perPage: storedData?.perPage ?? 5,
        });

        // Refresh stale data
        if (
          !storedData?.memberData ||
          isCacheStale(storedData.memberData.lastUpdated)
        ) {
          await refreshMembers(true);
        }
        if (
          !storedData?.objectTypeData ||
          isCacheStale(storedData.objectTypeData.lastUpdated)
        ) {
          await refreshObjectTypes(true);
        }
        if (
          !storedData?.tagData ||
          isCacheStale(storedData.tagData.lastUpdated)
        ) {
          await refreshTags(true);
        }
        if (
          !storedData?.funnelData ||
          isCacheStale(storedData.funnelData.lastUpdated)
        ) {
          await refreshFunnels(true);
        }
        // Fetch summary data
        if (
          !globalData?.summaryData ||
          isCacheStale(globalData?.summaryData?.lastUpdated)
        ) {
          await refreshSummary();
        }
        setInitialized(true);
      }
    };

    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialized,
    isCacheStale,
    loadFromStorage,
    refreshAll,
    refreshSummary,
    refreshFunnels,
    refreshObjectTypes,
    refreshTags,
    refreshMembers,
  ]);

  // Set up periodic refreshes
  useEffect(() => {
    if (!initialized || !authService.isAuthenticated()) {
      return;
    }

    const summaryInterval = setInterval(() => {
      refreshSummary();
    }, SUMMARY_REFRESH_INTERVAL);

    const dataInterval = setInterval(() => {
      refreshAll();
    }, CACHE_DURATION);

    return () => {
      clearInterval(summaryInterval);
      clearInterval(dataInterval);
    };
  }, [initialized, refreshAll, refreshSummary]);

  return (
    <GlobalContext.Provider
      value={{
        globalData,
        refreshMembers,
        refreshObjectTypes,
        refreshTags,
        fetchTag,
        refreshFunnels,
        refreshSummary,
        refreshAll,
        setGlobalPerPage,
        getTagsMeta,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};

// Add type guards for checking specific data availability
export const hasMemberData = (
  data: GlobalData | null
): data is GlobalData & { memberData: MemberData } => {
  return data?.memberData !== null;
};

export const hasObjectTypeData = (
  data: GlobalData | null
): data is GlobalData & { objectTypeData: ObjectTypeData } => {
  return data?.objectTypeData !== null;
};

export const hasTagData = (
  data: GlobalData | null
): data is GlobalData & { tagData: TagData } => {
  return data?.tagData !== null;
};

export const hasFunnelData = (
  data: GlobalData | null
): data is GlobalData & { funnelData: FunnelData } => {
  return data?.funnelData !== null;
};

export const hasSummaryData = (
  data: GlobalData | null
): data is GlobalData & { summaryData: SummaryData } => {
  return data?.summaryData !== null;
};
