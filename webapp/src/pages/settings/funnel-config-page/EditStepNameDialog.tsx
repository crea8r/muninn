import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
} from '@chakra-ui/react';
import { FunnelStep } from 'src/types';

interface EditStepNameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  step: FunnelStep | null;
  onSave: (stepId: string, newName: string) => void;
}

const EditStepNameDialog: React.FC<EditStepNameDialogProps> = ({
  isOpen,
  onClose,
  step,
  onSave,
}) => {
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (step) {
      setNewName(step.name);
    }
  }, [step]);

  const handleSave = () => {
    if (step && newName.trim() !== '') {
      onSave(step.id, newName.trim());
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Step Name</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder='Enter new step name'
          />
        </ModalBody>
        <ModalFooter>
          <Button colorScheme='blue' mr={3} onClick={handleSave}>
            Save
          </Button>
          <Button variant='ghost' onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditStepNameDialog;
