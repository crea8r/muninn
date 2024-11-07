// actions/add-to-funnel.ts
import { useCallback, useState } from 'react';
import { AddToFunnelDialog } from '../components/view-controller/table/AddToFunnelDialog';
import { TableAction } from '../types/table-actions';
import { FaFunnelDollar } from 'react-icons/fa';

export const createAddToFunnelAction = (onRefresh: () => void): TableAction => {
  let openAddToFunnelDialog: (data: any[]) => void;

  const AddToFunnelDialogWrapper: React.FC<{ onSuccess?: () => void }> = ({
    onSuccess,
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedObjects, setSelectedObjects] = useState<any[]>([]);

    openAddToFunnelDialog = useCallback((data: any[]) => {
      setSelectedObjects(data);
      setIsOpen(true);
    }, []);

    return (
      <AddToFunnelDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        selectedObjects={selectedObjects}
        onSuccess={onSuccess}
      />
    );
  };

  return {
    id: 'add-to-funnel',
    label: 'Funnel Changes',
    icon: <FaFunnelDollar />,
    tooltip: 'Add selected objects to a funnel step',
    onClick: (selectedItems) => {
      openAddToFunnelDialog(selectedItems);
    },
    DialogComponent: AddToFunnelDialogWrapper,
  };
};
