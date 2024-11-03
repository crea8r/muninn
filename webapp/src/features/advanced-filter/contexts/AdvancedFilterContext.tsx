// contexts/AdvancedFilterContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { FilterConfig } from '../types/filters';

export interface AdvancedFilterContextType {
  filterConfig: FilterConfig;
  updateFilter: (updates: Partial<FilterConfig>) => void;
  resetFilters: () => void;
}

const defaultConfig: FilterConfig = {
  page: 1,
  pageSize: 10,
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
    ...initialConfig,
  }));

  const updateFilter = useCallback(
    (updates: Partial<FilterConfig>) => {
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
    [onChange]
  );

  const resetFilters = useCallback(() => {
    const newConfig = { ...defaultConfig };
    setFilterConfig(newConfig);
    onChange?.(newConfig);
  }, [onChange]);

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