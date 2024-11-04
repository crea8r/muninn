// hooks/useColumnConfig.ts
import { useCallback, useMemo } from 'react';
import { ColumnConfig, ViewConfigBase } from '../types/view-config';
import { StandardColumn, TypeValueColumn } from '../types/column-config';

interface UseColumnConfigProps {
  config: ViewConfigBase;
  updateConfig: (updates: Partial<ViewConfigBase>) => void;
  viewRestrictions: {
    restrictedColumns: string[];
    requiredColumns: string[];
  };
}

export const useColumnConfig = ({
  config,
  updateConfig,
  viewRestrictions,
}: UseColumnConfigProps) => {
  // Update column visibility
  const toggleColumnVisibility = useCallback(
    (field: string, visible: boolean) => {
      if (viewRestrictions.requiredColumns.includes(field) && !visible) {
        return; // Cannot hide required columns
      }

      const newColumns = config.columns.map((col) =>
        col.field === field ? { ...col, visible } : col
      );

      updateConfig({ columns: newColumns });
    },
    [config.columns, updateConfig, viewRestrictions.requiredColumns]
  );

  // Update column order
  const reorderColumns = useCallback(
    (startIndex: number, endIndex: number) => {
      const newColumns = [...config.columns];
      const [removed] = newColumns.splice(startIndex, 1);
      newColumns.splice(endIndex, 0, removed);

      // Update order property
      const reorderedColumns = newColumns.map((col, index) => ({
        ...col,
        order: index,
      }));

      updateConfig({ columns: reorderedColumns });
    },
    [config.columns, updateConfig]
  );

  // Add new column
  const addColumn = useCallback(
    (column: StandardColumn | TypeValueColumn) => {
      const existingColumn = config.columns.find((col) =>
        'objectTypeId' in column
          ? col.field === column.field &&
            col.objectTypeId === column.objectTypeId
          : col.field === column.field
      );

      if (existingColumn) {
        const newColumns = config.columns.map((col) =>
          col === existingColumn ? { ...col, visible: true } : col
        );
        updateConfig({ columns: newColumns });
        return;
      }

      const newColumn: ColumnConfig = {
        field: column.field,
        width: column.width,
        visible: true,
        order: config.columns.length,
        formatType: column.formatType,
        label: column.label || column.field,
        sortable: column.sortable || false,
        ...('objectTypeId' in column
          ? { objectTypeId: column.objectTypeId }
          : {}),
      };
      console.log('addColumn', newColumn);
      updateConfig({
        columns: [...config.columns, newColumn],
      });
    },
    [config.columns, updateConfig]
  );

  // Remove column
  const removeColumn = useCallback(
    (field: string, objectTypeId?: string) => {
      if (viewRestrictions.requiredColumns.includes(field)) {
        return; // Cannot remove required columns
      }

      const newColumns = config.columns.filter((col) => {
        if (objectTypeId) {
          return !(col.field === field && col.objectTypeId === objectTypeId);
        }
        return col.field !== field;
      });

      updateConfig({ columns: newColumns });
    },
    [config.columns, updateConfig, viewRestrictions.requiredColumns]
  );

  // Update column width
  const updateColumnWidth = useCallback(
    (field: string, width: number, objectTypeId?: string) => {
      const newColumns = config.columns.map((col) => {
        if (objectTypeId) {
          return col.field === field && col.objectTypeId === objectTypeId
            ? { ...col, width }
            : col;
        }
        return col.field === field ? { ...col, width } : col;
      });

      updateConfig({ columns: newColumns });
    },
    [config.columns, updateConfig]
  );

  // Get visible columns in order
  const visibleColumns = useMemo(
    () =>
      config.columns
        .filter((col) => col.visible)
        .sort((a, b) => a.order - b.order),
    [config.columns]
  );

  return {
    visibleColumns,
    toggleColumnVisibility,
    reorderColumns,
    addColumn,
    removeColumn,
    updateColumnWidth,
  };
};
