// hooks/useAdvancedFilterData.ts
import { useState, useEffect } from 'react';
import { FilterConfig } from '../types/filters';
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
  const fetchData = async () => {
    console.log('fetchData ...');
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
      console.error('Failed to fetch filtered data:', err);
      setError(err as Error);
      setData([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilter]);

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
