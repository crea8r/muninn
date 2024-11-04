// actions/add-tag.ts
import { useCallback, useState } from 'react';
import { TableAction } from '../types/table-actions';
import { TagLeftIcon } from '@chakra-ui/react';
import { AddTagDialog } from '../components/view-controller/table/AddTagDialog';

export const createAddTagAction = (onRefresh: () => void): TableAction => {
  let openAddTagDialog: (data: any[]) => void;

  const AddTagDialogWrapper = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedObjects, setSelectedObjects] = useState<any[]>([]);

    openAddTagDialog = useCallback((data: any[]) => {
      setSelectedObjects(data);
      setIsOpen(true);
    }, []);

    return (
      <AddTagDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        selectedObjects={selectedObjects}
        onSuccess={onRefresh}
      />
    );
  };

  return {
    id: 'add-tag',
    label: 'Add Tag',
    icon: <TagLeftIcon />,
    tooltip: 'Add tag to selected objects',
    onClick: (selectedItems) => {
      openAddTagDialog(selectedItems);
    },
    DialogComponent: AddTagDialogWrapper,
  };
};
