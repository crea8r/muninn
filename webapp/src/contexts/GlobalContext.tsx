import React, { createContext, useState, useContext, useEffect } from 'react';
import { OrgMember } from 'src/types/Org';
import authService from 'src/services/authService';
import { personalSummarize, listOrgMembers } from 'src/api';
import { PersonalSummarize } from 'src/types/Summarize';

interface GlobalData {
  members: OrgMember[];
  unseenFeedsCount: number;
  tasksCount: number;
  perPage: number;
}

interface GlobalContextType {
  globalData: GlobalData | null;
  refreshGlobalData: () => Promise<void>;
  setGlobalPerPage: (perPage: number) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [globalData, setGlobalData] = useState<GlobalData | null>(null);

  const setGlobalPerPage = (perPage: number) => {
    setGlobalData((prev) => {
      if (prev) {
        return { ...prev, perPage };
      }
      return null;
    });
    localStorage.setItem('perPage', perPage.toString());
  };

  const refreshGlobalData = async () => {
    try {
      if (authService.isAuthenticated()) {
        const pS: PersonalSummarize = await personalSummarize();
        const members = await listOrgMembers();
        setGlobalData({
          members,
          unseenFeedsCount: pS.unseen,
          tasksCount: pS.ongoingTask,
          perPage: parseInt(localStorage.getItem('perPage') || '5'),
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
    <GlobalContext.Provider
      value={{ globalData, refreshGlobalData, setGlobalPerPage }}
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
