// hooks/useResizeColumns.ts
import { useState, useCallback } from 'react';
import { ColumnConfig } from '../types/view-config';
import React from 'react';

interface UseResizeColumnsProps {
  columns: ColumnConfig[];
  onColumnResize: (field: string, width: number, objectTypeId?: string) => void;
}

export const useResizeColumns = ({
  columns,
  onColumnResize,
}: UseResizeColumnsProps) => {
  const [resizing, setResizing] = useState<number | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  const handleResizeStart = useCallback(
    (index: number, event: MouseEvent) => {
      setResizing(index);
      setStartX(event.pageX);
      setStartWidth(columns[index].width || 0);
    },
    [columns]
  );

  const handleResizeMove = useCallback(
    (event: MouseEvent) => {
      if (resizing === null) return;

      const diff = event.pageX - startX;
      const newWidth = Math.max(50, startWidth + diff);
      const column = columns[resizing];

      onColumnResize(column.field, newWidth, column.objectTypeId);
    },
    [resizing, startX, startWidth, columns, onColumnResize]
  );

  const handleResizeEnd = useCallback(() => {
    setResizing(null);
  }, []);

  const getResizeProps = useCallback(
    (index: number) => ({
      onMouseDown: (e: React.MouseEvent) =>
        handleResizeStart(index, e as unknown as MouseEvent),
      style: { cursor: 'col-resize' },
    }),
    [handleResizeStart]
  );

  React.useEffect(() => {
    if (resizing !== null) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizing, handleResizeMove, handleResizeEnd]);

  return {
    getResizeProps,
    columnWidths: columns.map((col) => col.width),
  };
};
