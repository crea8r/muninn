// actions/export-csv.ts
import { TableAction } from '../types/table-actions';
import { DownloadIcon } from '@chakra-ui/icons';
import { ColumnConfig } from '../types/view-config';
import { useState, useCallback } from 'react';
import { ExportDialog } from '../components/view-controller/dialogs/ExportDialog';

interface ExportCsvActionProps {
  columns: ColumnConfig[];
  getColumnLabel: (column: ColumnConfig) => string;
}

export const createExportCsvAction = ({
  columns,
  getColumnLabel,
}: ExportCsvActionProps): TableAction => {
  // Using a closure to access the state and handlers
  let openExportDialog: (data: any[]) => void;

  const ExportDialogWrapper = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [dataToExport, setDataToExport] = useState<any[]>([]);

    // Store the openDialog function in our closure
    openExportDialog = useCallback((data: any[]) => {
      setDataToExport(data);
      setIsOpen(true);
    }, []);

    const handleExport = (filename: string) => {
      const visibleColumns = columns.filter((col) => col.visible);

      // Create headers using column labels
      const headers = visibleColumns.map((col) => getColumnLabel(col));

      // Create CSV content
      const csvContent = [
        // Headers row
        headers.map((header) => `"${header}"`).join(','),
        // Data rows
        ...dataToExport.map((item) =>
          visibleColumns
            .map((column) => {
              const value = column.objectTypeId
                ? item.type_values?.find(
                    (tv: any) => tv.objectTypeId === column.objectTypeId
                  )?.type_values[column.field]
                : item[column.field];

              // Handle different value types
              if (value === null || value === undefined) return '""';
              if (typeof value === 'string')
                return `"${value.replace(/"/g, '""')}"`;
              if (typeof value === 'object')
                return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
              return `"${value}"`;
            })
            .join(',')
        ),
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
      <ExportDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onExport={handleExport}
      />
    );
  };

  return {
    id: 'export-csv',
    label: 'Export CSV',
    icon: <DownloadIcon />,
    tooltip: 'Export selected items to CSV',
    onClick: (selectedItems) => {
      openExportDialog(selectedItems);
    },
    DialogComponent: ExportDialogWrapper,
  };
};
