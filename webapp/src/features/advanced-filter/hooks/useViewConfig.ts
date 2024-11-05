// hooks/useViewConfig.ts
import { useState, useCallback, useMemo } from 'react';
import { ViewConfigBase, ViewConfigSource } from '../types/view-config';
import { PREDEFINED_VIEWS } from '../constants/predefined-views';
import { STANDARD_COLUMNS } from '../constants/default-columns';

interface UseViewConfigProps {
  source: ViewConfigSource;
  initialConfig?: ViewConfigBase;
  onConfigChange?: (config: ViewConfigBase) => void;
}

export const useViewConfig = ({
  source,
  initialConfig,
  onConfigChange,
}: UseViewConfigProps) => {
  const [config, setConfig] = useState<ViewConfigBase>(() => {
    if (initialConfig) return initialConfig;

    if (source.type === 'predefined') {
      const predefinedView = PREDEFINED_VIEWS[source.id];
      return predefinedView.getConfig(source.params);
    }

    return {
      displayMode: 'table',
      density: 'comfortable',
      columns: STANDARD_COLUMNS.map((col, index) => ({
        field: col.field,
        width: col.width,
        label: col.label,
        visible: col.defaultVisible,
        order: col.order,
        formatType: col.formatType,
        sortable: col.sortable,
      })),
    };
  });

  // Get view restrictions
  const viewRestrictions = useMemo(() => {
    if (source.type === 'predefined') {
      const predefinedView = PREDEFINED_VIEWS[source.id];
      return {
        allowCustomization: predefinedView.allowCustomization,
        restrictedColumns: predefinedView.restrictedColumns || [],
        requiredColumns: predefinedView.requiredColumns || [],
      };
    }
    return {
      allowCustomization: true,
      restrictedColumns: [],
      requiredColumns: ['name'],
    };
  }, [source]);

  // Handle configuration updates
  const updateConfig = useCallback(
    (updates: Partial<ViewConfigBase>) => {
      setConfig((prev) => {
        const newConfig = { ...prev, ...updates };
        // Always notify parent of changes
        onConfigChange?.(newConfig);
        return newConfig;
      });
    },
    [onConfigChange]
  );

  // Reset to default configuration
  const resetConfig = useCallback(() => {
    const newConfig =
      source.type === 'predefined'
        ? PREDEFINED_VIEWS[source.id].getConfig(source.params)
        : initialConfig || {
            displayMode: 'table',
            density: 'comfortable',
            columns: STANDARD_COLUMNS.map((col, index) => ({
              field: col.field,
              label: col.label,
              width: col.width,
              visible: col.defaultVisible,
              order: col.order,
              formatType: col.formatType,
            })),
          };

    setConfig(newConfig);
    onConfigChange?.(newConfig);
  }, [source, initialConfig, onConfigChange]);

  return {
    config,
    updateConfig,
    resetConfig,
    viewRestrictions,
  };
};
