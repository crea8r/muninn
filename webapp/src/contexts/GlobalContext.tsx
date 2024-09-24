import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { listOrgMembers } from 'src/api/orgMember';
import { OrgMember } from 'src/types/Org';
import authService from 'src/services/authService';

interface GlobalData {
  members: OrgMember[];
  unseenFeedsCount: number;
  tasksCount: number;
}

interface GlobalContextType {
  globalData: GlobalData | null;
  refreshGlobalData: () => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [globalData, setGlobalData] = useState<GlobalData | null>(null);

  const refreshGlobalData = useCallback(async () => {
    try {
      if (authService.isAuthenticated()) {
        const members = await listOrgMembers();
        setGlobalData({
          members,
          unseenFeedsCount: 0,
          tasksCount: 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch global data:', error);
    }
  }, []);
  const value = useMemo(
    () => ({ globalData, refreshGlobalData }),
    [globalData, refreshGlobalData]
  );

  useEffect(() => {
    refreshGlobalData();
  }, [refreshGlobalData]);

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};
