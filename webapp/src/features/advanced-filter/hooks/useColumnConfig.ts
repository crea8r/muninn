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
  // Toggle column visibility
  const toggleColumnVisibility = useCallback(
    (field: string, visible: boolean, objectTypeId?: string) => {
      if (
        viewRestrictions.requiredColumns.includes(field) &&
        objectTypeId === undefined &&
        !visible
      ) {
        return;
      }

      const newColumns = config.columns.map((col) => {
        if (col.field === field && col.objectTypeId === objectTypeId) {
          if (visible) {
            // Assign order when making visible
            return {
              ...col,
              visible,
              order: config.columns.filter((c) => c.visible).length,
            };
          } else {
            // Remove order when making invisible
            const { order, ...restCol } = col;
            return {
              ...restCol,
              visible,
            };
          }
        }
        return col;
      });

      updateConfig({ columns: newColumns });
    },
    [config.columns, updateConfig, viewRestrictions.requiredColumns]
  );

  // Update column order
  const reorderColumns = (oldIndex: number, newIndex: number) => {
    const orderedColumns = structuredClone([...config.columns]);
    let tmp = [];
    for (var i = 0; i < orderedColumns.length; i++) {
      if (orderedColumns[i].visible) {
        tmp.push({
          index: i,
          field: orderedColumns[i].field,
          order: orderedColumns[i].order,
        });
      }
    }
    tmp = tmp.sort((a, b) => a.order - b.order);
    const [moved] = tmp.splice(oldIndex, 1);
    tmp = [...tmp.slice(0, newIndex), moved, ...tmp.slice(newIndex)];
    for (i = 0; i < tmp.length; i++) {
      orderedColumns[tmp[i].index].order = i + 1;
    }
    updateConfig({ columns: orderedColumns });
  };

  // When adding a new column
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
          col === existingColumn
            ? {
                ...col,
                visible: true,
                // Assign order when making visible
                order: config.columns.filter((c) => c.visible).length,
              }
            : col
        );
        updateConfig({ columns: newColumns });
        return;
      }

      const newColumn: ColumnConfig = {
        field: column.field,
        width: column.width,
        visible: true,
        order: config.columns.filter((c) => c.visible).length,
        sortable: true,
        formatType: column.formatType,
        ...('objectTypeId' in column
          ? { objectTypeId: column.objectTypeId }
          : {}),
      };

      updateConfig({
        columns: [...config.columns, newColumn],
      });
    },
    [config.columns, updateConfig]
  );

  // Remove column
  const removeColumn = useCallback(
    (field: string, objectTypeId?: string) => {
      if (viewRestrictions.requiredColumns.includes(field) && !objectTypeId) {
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

  // Get visible columns sorted by order
  const visibleColumns = useMemo(() => {
    return config.columns
      .filter((col) => col.visible)
      .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
  }, [config.columns]);

  return {
    visibleColumns,
    toggleColumnVisibility,
    reorderColumns,
    addColumn,
    removeColumn,
    updateColumnWidth,
  };
};
