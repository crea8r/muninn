// contexts/AdvancedFilterContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { FilterConfig } from 'src/types/FilterConfig';
import { STORAGE_KEYS, useGlobalContext } from 'src/contexts/GlobalContext';

export interface AdvancedFilterContextType {
  filterConfig: FilterConfig;
  updateFilter: (updates: Partial<FilterConfig>) => void;
  resetFilters: () => void;
}

const defaultConfig: FilterConfig = {
  page: 1,
  pageSize: parseInt(localStorage.getItem(STORAGE_KEYS.PER_PAGE)) || 10,
};

const AdvancedFilterContext = createContext<
  AdvancedFilterContextType | undefined
>(undefined);

interface AdvancedFilterProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<FilterConfig>;
  onChange?: (config: FilterConfig) => void;
}

export const AdvancedFilterProvider: React.FC<AdvancedFilterProviderProps> = ({
  children,
  initialConfig,
  onChange,
}) => {
  const [filterConfig, setFilterConfig] = useState<FilterConfig>(() => ({
    ...defaultConfig,
    ...structuredClone(initialConfig),
  }));
  const { setGlobalPerPage } = useGlobalContext();

  const updateFilter = useCallback(
    (updates: Partial<FilterConfig>) => {
      if (updates.pageSize) {
        setGlobalPerPage(updates.pageSize);
      }
      setFilterConfig((prev) => {
        const newConfig = {
          ...prev,
          ...updates,
          // Reset to page 1 if any filter except page/pageSize changes
          page:
            updates.page ||
            (Object.keys(updates).some((key) => key !== 'pageSize')
              ? 1
              : prev.page),
        };

        // Notify parent component of changes
        onChange?.(newConfig);

        return newConfig;
      });
    },
    [onChange, setGlobalPerPage]
  );

  const resetFilters = useCallback(() => {
    const newConfig = { ...defaultConfig };
    setFilterConfig(newConfig);
    onChange?.(newConfig);
  }, [onChange]);

  useEffect(() => {
    setFilterConfig({
      ...defaultConfig,
      ...structuredClone(initialConfig),
    });
  }, [initialConfig]);

  return (
    <AdvancedFilterContext.Provider
      value={{
        filterConfig,
        updateFilter,
        resetFilters,
      }}
    >
      {children}
    </AdvancedFilterContext.Provider>
  );
};

export const useAdvancedFilter = () => {
  const context = useContext(AdvancedFilterContext);
  if (!context) {
    throw new Error(
      'useAdvancedFilter must be used within an AdvancedFilterProvider'
    );
  }
  return context;
};
