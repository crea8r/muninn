import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { OrgMember } from 'src/types/Org';
import authService from 'src/services/authService';
import { personalSummarize, listOrgMembers } from 'src/api';
import { PersonalSummarize } from 'src/types/Summarize';

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

  const refreshGlobalData = async () => {
    try {
      if (authService.isAuthenticated()) {
        const pS: PersonalSummarize = await personalSummarize();
        const members = await listOrgMembers();
        setGlobalData({
          members,
          unseenFeedsCount: pS.unseen,
          tasksCount: pS.ongoingTask,
        });
      }
    } catch (error) {
      console.error('Failed to fetch global data:', error);
    }
  };

  useEffect(() => {
    refreshGlobalData();
  }, []);

  return (
    <GlobalContext.Provider value={{ globalData, refreshGlobalData }}>
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
