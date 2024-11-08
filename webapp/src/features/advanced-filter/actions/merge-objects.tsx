// actions/merge-objects.ts
import { TableAction } from '../types/table-actions';
import { FaRulerCombined } from 'react-icons/fa';
import { useCallback, useState } from 'react';
import { MergeObjectsDialog } from '../components/view-controller/table/MergeObjectsDialog';

export const createMergeObjectsAction = (
  onSuccess: () => void
): TableAction => {
  let openMergeDialog: (data: any[]) => void;

  const MergeDialogWrapper: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedObjects, setSelectedObjects] = useState<any[]>([]);

    openMergeDialog = useCallback((data: any[]) => {
      setSelectedObjects(data);
      setIsOpen(true);
    }, []);

    return (
      <MergeObjectsDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        selectedObjects={selectedObjects}
        onSuccess={onSuccess}
      />
    );
  };

  return {
    id: 'merge-objects',
    label: 'Merge Objects',
    icon: <FaRulerCombined />,
    tooltip: 'Merge selected objects',
    onClick: (selectedItems) => {
      if (selectedItems.length < 2) {
        return 'Please select at least 2 objects to merge';
      }
      if (selectedItems.length > 5) {
        return 'Please select at most 5 objects to merge';
      }
      openMergeDialog(selectedItems);
    },
    DialogComponent: MergeDialogWrapper,
  };
};
