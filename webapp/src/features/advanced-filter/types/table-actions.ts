import { ReactElement } from 'react';

export interface TableAction {
  id: string;
  label: string;
  icon?: ReactElement;
  onClick: (selectedItems: any[]) => void;
  tooltip?: string;
  // Add more properties for future extension
  disabled?: boolean;
  requiredPermissions?: string[];
  confirmationMessage?: string;
  DialogComponent?: React.FC<{ onSuccess?: () => void }>;
}
