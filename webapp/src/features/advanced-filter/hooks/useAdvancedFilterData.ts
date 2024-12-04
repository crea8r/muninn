// hooks/useAdvancedFilterData.ts
import { useState, useEffect, useCallback } from 'react';
import { FilterConfig } from 'src/types/FilterConfig';
import { fetchAdvancedFilterResults } from '../services/advancedFilterApi';
import { useDebounceFilter } from './useDebounceFilter';

export const useAdvancedFilterData = (filterConfig: FilterConfig) => {
  const [data, setData] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stepCounts, setStepCounts] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Add debug logging for type value criteria
  useEffect(() => {
    if (filterConfig.typeValueCriteria) {
      console.debug(
        'Type value criteria updated:',
        filterConfig.typeValueCriteria
      );
    }
  }, [filterConfig.typeValueCriteria]);

  const debouncedFilter = useDebounceFilter(filterConfig, 300);
  const fetchData = useCallback(async () => {
    if (!debouncedFilter) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchAdvancedFilterResults(debouncedFilter);
      setData(response.items || []);
      if (typeof response.total_count === 'object') {
        setTotalCount(response.total_count.total_count);
        setStepCounts(response.total_count.step_counts);
      } else {
        setTotalCount(response.total_count);
      }
    } catch (err) {
      setError(err as Error);
      setData([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedFilter]);

  useEffect(() => {
    fetchData();
  }, [debouncedFilter, fetchData]);

  return {
    data,
    totalCount,
    stepCounts,
    isLoading,
    error,
    refetch: fetchData,
    selectedItems,
    setSelectedItems,
  };
};
