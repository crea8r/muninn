// src/contexts/ObjectTypesContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { ObjectType } from 'src/types';
import { listObjectTypes } from 'src/api/objType';
import { useToast } from '@chakra-ui/react';

export interface ObjectTypesCache {
  [key: string]: string; // Maps ObjectType ID to name
}

export interface ObjectTypesContextValue {
  objectTypes: ObjectTypesCache;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>; // Function to force refresh the cache
}

const ObjectTypesContext = createContext<ObjectTypesContextValue | undefined>(
  undefined
);

// Cache duration in milliseconds (2 minutes)
const CACHE_DURATION = 2 * 60 * 1000;

export const ObjectTypesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [objectTypes, setObjectTypes] = useState<ObjectTypesCache>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const toast = useToast();

  const fetchObjectTypes = useCallback(
    async (force: boolean = false) => {
      const now = Date.now();

      // Check if we should fetch based on cache time
      if (!force && lastFetchTime && now - lastFetchTime < CACHE_DURATION) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await listObjectTypes({
          page: 1,
          pageSize: 100,
        });

        const typesMap = response.objectTypes.reduce(
          (acc, type: ObjectType) => {
            acc[type.id] = type.name;
            return acc;
          },
          {} as ObjectTypesCache
        );

        setObjectTypes(typesMap);
        setLastFetchTime(now);

        // Store in localStorage for persistence
        localStorage.setItem('objectTypes', JSON.stringify(typesMap));
        localStorage.setItem('objectTypesLastFetch', now.toString());
      } catch (err) {
        setError(err as Error);
        toast({
          title: 'Error loading object types',
          description: 'Type names may not display correctly',
          status: 'error',
          duration: 5000,
        });

        // Try to load from localStorage if available
        const cached = localStorage.getItem('objectTypes');
        if (cached) {
          setObjectTypes(JSON.parse(cached));
        }
      } finally {
        setIsLoading(false);
      }
    },
    [toast, lastFetchTime]
  );

  // Initial load - check localStorage first
  useEffect(() => {
    const loadInitialData = async () => {
      const cached = localStorage.getItem('objectTypes');
      const lastFetch = localStorage.getItem('objectTypesLastFetch');

      if (cached && lastFetch) {
        const parsedLastFetch = parseInt(lastFetch, 10);
        setObjectTypes(JSON.parse(cached));
        setLastFetchTime(parsedLastFetch);
        setIsLoading(false);

        // If cache is old, refresh in background
        if (Date.now() - parsedLastFetch >= CACHE_DURATION) {
          fetchObjectTypes(true);
        }
      } else {
        fetchObjectTypes(true);
      }
    };

    loadInitialData();
  }, [fetchObjectTypes]);

  // Force refresh function
  const refresh = useCallback(async () => {
    await fetchObjectTypes(true);
  }, [fetchObjectTypes]);

  const value = {
    objectTypes,
    isLoading,
    error,
    refresh,
  };

  return (
    <ObjectTypesContext.Provider value={value}>
      {children}
    </ObjectTypesContext.Provider>
  );
};

export const useObjectTypes = () => {
  const context = useContext(ObjectTypesContext);
  if (!context) {
    throw new Error(
      'useObjectTypes must be used within an ObjectTypesProvider'
    );
  }
  return context;
};
