import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import api from '../service/automation';
import { AutomatedAction } from 'src/types/Automation';

export const useAutomationList = (initialPageSize: number = 10) => {
  const [automations, setAutomations] = useState<AutomatedAction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const fetchAutomations = useCallback(
    async (search?: string) => {
      setIsLoading(true);
      try {
        const response = await api.listAutomations(
          currentPage,
          initialPageSize,
          search
        );
        setAutomations(response.data);
        setTotalCount(response.totalCount);
      } catch (error) {
        toast({
          title: 'Error loading automations',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, initialPageSize, toast]
  );

  const deleteAutomation = useCallback(
    async (id: string) => {
      try {
        await api.deleteAutomation(id);
        await fetchAutomations();
        toast({
          title: 'Automation deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Error deleting automation',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [fetchAutomations, toast]
  );

  return {
    automations,
    totalCount,
    currentPage,
    isLoading,
    setCurrentPage,
    fetchAutomations,
    deleteAutomation,
  };
};
