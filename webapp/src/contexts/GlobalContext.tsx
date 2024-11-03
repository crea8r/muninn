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
import { listTags } from 'src/api/tag';
import { fetchAllFunnels } from 'src/api/funnel';
import { PersonalSummarize } from 'src/types/Summarize';

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
  refreshFunnels: () => Promise<void>;
  refreshSummary: () => Promise<void>;
  refreshAll: () => Promise<void>;
  setGlobalPerPage: (perPage: number) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);
// Cache duration increased to 10 minutes
const CACHE_DURATION = 10 * 60 * 1000;
// Summary refresh interval remains at 1 minute
const SUMMARY_REFRESH_INTERVAL = 60 * 1000;

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [globalData, setGlobalData] = useState<GlobalData | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Helper function to check if cache is stale
  const isCacheStale = (lastUpdated: number | undefined) => {
    if (!lastUpdated) return true;
    return Date.now() - lastUpdated > CACHE_DURATION;
  };

  // Separate refresh functions for each data type
  const refreshMembers = useCallback(
    async (force: boolean = false) => {
      if (!force && !isCacheStale(globalData?.memberData?.lastUpdated)) {
        return;
      }

      try {
        const members = await listOrgMembers();
        setGlobalData((prev) => ({
          ...prev!,
          memberData: {
            members,
            lastUpdated: Date.now(),
          },
        }));
      } catch (error) {
        console.error('Failed to fetch members:', error);
      }
    },
    [globalData?.memberData?.lastUpdated]
  );

  const refreshObjectTypes = useCallback(
    async (force: boolean = false) => {
      if (!force && !isCacheStale(globalData?.objectTypeData?.lastUpdated)) {
        return;
      }

      try {
        const response = await listObjectTypes({
          page: 1,
          pageSize: 100, // Assuming we want to load all object types
        });
        setGlobalData((prev) => ({
          ...prev!,
          objectTypeData: {
            objectTypes: response.objectTypes,
            lastUpdated: Date.now(),
          },
        }));
      } catch (error) {
        console.error('Failed to fetch object types:', error);
      }
    },
    [globalData?.objectTypeData?.lastUpdated]
  );

  const refreshTags = useCallback(
    async (force: boolean = false) => {
      if (!force && !isCacheStale(globalData?.tagData?.lastUpdated)) {
        return;
      }

      try {
        const response = await listTags({
          page: 1,
          pageSize: 100, // Assuming we want to load all tags
        });
        setGlobalData((prev) => ({
          ...prev!,
          tagData: {
            tags: response.tags,
            lastUpdated: Date.now(),
          },
        }));
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      }
    },
    [globalData?.tagData?.lastUpdated]
  );

  const refreshFunnels = useCallback(
    async (force: boolean = false) => {
      if (!force && !isCacheStale(globalData?.funnelData?.lastUpdated)) {
        return;
      }

      try {
        const response = await fetchAllFunnels(
          1,
          100 // Assuming we want to load all funnels
        );
        setGlobalData((prev) => ({
          ...prev!,
          funnelData: {
            funnels: response.funnels,
            lastUpdated: Date.now(),
          },
        }));
      } catch (error) {
        console.error('Failed to fetch funnels:', error);
      }
    },
    [globalData?.funnelData?.lastUpdated]
  );

  const refreshSummary = useCallback(
    async (force: boolean = false) => {
      if (!force && !isCacheStale(globalData?.summaryData?.lastUpdated)) {
        return;
      }

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
    },
    [globalData?.summaryData?.lastUpdated]
  );

  const refreshAll = useCallback(async () => {
    if (!authService.isAuthenticated()) return;

    await Promise.all([
      refreshMembers(true),
      refreshObjectTypes(true),
      refreshTags(true),
      refreshFunnels(true),
      refreshSummary(true),
    ]);
  }, [
    refreshFunnels,
    refreshMembers,
    refreshObjectTypes,
    refreshSummary,
    refreshTags,
  ]);

  const setGlobalPerPage = (perPage: number) => {
    setGlobalData((prev) => (prev ? { ...prev, perPage } : null));
    localStorage.setItem('perPage', perPage.toString());
  };

  // Initial setup effect
  useEffect(() => {
    const initializeData = async () => {
      if (authService.isAuthenticated() && !initialized) {
        // Initialize with stored perPage
        setGlobalData({
          memberData: null,
          objectTypeData: null,
          tagData: null,
          funnelData: null,
          summaryData: null,
          perPage: parseInt(localStorage.getItem('perPage') || '5'),
        });

        // Initial load of all data
        await refreshAll();
        setInitialized(true);
      }
    };

    initializeData();
  }, [initialized, refreshAll]);

  // Keep only the summary on a short interval as it's most time-sensitive
  useEffect(() => {
    if (!initialized || !authService.isAuthenticated()) {
      return;
    }

    // Only set up summary refresh interval
    const summaryInterval = setInterval(() => {
      refreshSummary();
    }, SUMMARY_REFRESH_INTERVAL);

    // Safety net refresh for all data every 10 minutes
    const dataInterval = setInterval(() => {
      refreshAll();
    }, CACHE_DURATION);

    return () => {
      clearInterval(summaryInterval);
      clearInterval(dataInterval);
    };
  }, [initialized, refreshSummary, refreshAll]);

  return (
    <GlobalContext.Provider
      value={{
        globalData,
        refreshMembers,
        refreshObjectTypes,
        refreshTags,
        refreshFunnels,
        refreshSummary,
        refreshAll,
        setGlobalPerPage,
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
