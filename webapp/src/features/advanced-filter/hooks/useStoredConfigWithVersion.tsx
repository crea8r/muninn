// hooks/useStoredConfigWithVersion.ts
import { useState, useEffect, useCallback } from 'react';
import { FilterConfig } from 'src/types/FilterConfig';
import { ViewConfigBase } from '../types/view-config';
import {
  DEFAULT_FILTER_CONFIG,
  DEFAULT_VIEW_CONFIG,
} from '../constants/default-config';
import { useGlobalContext } from 'src/contexts/GlobalContext';

const STORAGE_KEY = 'advanced-listing-config';
const CURRENT_CONFIG_VERSION = '1.0';

interface StoredConfigWithVersion {
  version: string;
  filter: Omit<FilterConfig, 'search' | 'page'>;
  view: ViewConfigBase;
  lastUpdated: number;
}

export const useStoredConfigWithVersion = () => {
  const { globalData } = useGlobalContext();
  const [initialConfig, setInitialConfig] = useState<{
    filter?: Partial<FilterConfig>;
    view?: Partial<ViewConfigBase>;
  } | null>(null);

  // Load config from local storage with version check
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let config: {
        filter: Partial<FilterConfig>;
        view: Partial<ViewConfigBase>;
      };

      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.version === CURRENT_CONFIG_VERSION) {
          // Merge stored config with defaults
          config = {
            filter: {
              ...DEFAULT_FILTER_CONFIG,
              ...parsed.filter,
              // Always use global pageSize
              pageSize: globalData?.perPage || DEFAULT_FILTER_CONFIG.pageSize,
            },
            view: {
              ...DEFAULT_VIEW_CONFIG,
              ...parsed.view,
              // Merge columns, preserving stored visibility and order
              columns: mergeColumns(
                DEFAULT_VIEW_CONFIG.columns,
                parsed.view.columns
              ),
            },
          };
        } else {
          // Version mismatch - use defaults
          config = {
            filter: {
              ...DEFAULT_FILTER_CONFIG,
              pageSize: globalData?.perPage || DEFAULT_FILTER_CONFIG.pageSize,
            },
            view: DEFAULT_VIEW_CONFIG,
          };
        }
      } else {
        // No stored config - use defaults
        config = {
          filter: {
            ...DEFAULT_FILTER_CONFIG,
            pageSize: globalData?.perPage || DEFAULT_FILTER_CONFIG.pageSize,
          },
          view: DEFAULT_VIEW_CONFIG,
        };
      }

      setInitialConfig(config);
    } catch (error) {
      console.error('Error loading stored config:', error);
      // On error, fallback to defaults
      setInitialConfig({
        filter: {
          ...DEFAULT_FILTER_CONFIG,
          pageSize: globalData?.perPage || DEFAULT_FILTER_CONFIG.pageSize,
        },
        view: DEFAULT_VIEW_CONFIG,
      });
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [globalData?.perPage]);

  // Helper function to merge default columns with stored columns
  const mergeColumns = (
    defaultColumns: typeof DEFAULT_VIEW_CONFIG.columns,
    storedColumns: typeof DEFAULT_VIEW_CONFIG.columns = []
  ) => {
    // Create a map of stored columns for easy lookup
    const storedColumnMap = new Map(
      storedColumns.map((col) => [
        col.objectTypeId ? `${col.objectTypeId}-${col.field}` : col.field,
        col,
      ])
    );

    // Start with default columns
    const df = defaultColumns.map((defaultCol) => {
      const key = defaultCol.objectTypeId
        ? `${defaultCol.objectTypeId}-${defaultCol.field}`
        : defaultCol.field;
      const storedCol = storedColumnMap.get(key);

      if (storedCol) {
        // Preserve stored visibility and order
        return {
          ...defaultCol,
          visible: storedCol.visible,
          order: storedCol.order,
          width: storedCol.width || defaultCol.width,
        };
      }
      return defaultCol;
    });
    return [
      ...df,
      ...storedColumns.filter((col: any) => col.objectTypeId !== undefined),
    ];
  };

  const saveConfig = useCallback(
    (filter: FilterConfig, view: ViewConfigBase) => {
      try {
        const { search, page, ...filterToStore } = filter;
        const configToStore: StoredConfigWithVersion = {
          version: CURRENT_CONFIG_VERSION,
          filter: filterToStore,
          view,
          lastUpdated: Date.now(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(configToStore));
      } catch (error) {
        console.error('Error saving config:', error);
      }
    },
    []
  );

  return {
    initialConfig,
    saveConfig,
  };
};
