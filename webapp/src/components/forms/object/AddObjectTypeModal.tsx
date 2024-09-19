// AddObjectTypeModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Select,
  Input,
  VStack,
} from '@chakra-ui/react';
import { ObjectType } from 'src/types/';

interface AddObjectTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTypes: ObjectType[];
  onAddType: (payload: any) => void;
}

const AddObjectTypeModal: React.FC<AddObjectTypeModalProps> = ({
  isOpen,
  onClose,
  availableTypes,
  onAddType,
}) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [typeValues, setTypeValues] = useState<{ [key: string]: string }>({});

  const handleAddType = () => {
    if (!selectedType) return;
    onAddType({
      typeId: selectedType,
      values: typeValues,
    });
    resetForm();
  };

  const resetForm = () => {
    setSelectedType('');
    setTypeValues({});
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Object Type</ModalHeader>
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Select Type</FormLabel>
              <Select
                placeholder='Select type'
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  const selectedTypeFields =
                    availableTypes.find((t) => t.id === e.target.value)
                      ?.fields || {};
                  setTypeValues(
                    Object.fromEntries(
                      Object.keys(selectedTypeFields).map((key) => [key, ''])
                    )
                  );
                }}
              >
                {availableTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            {Object.entries(typeValues).map(([field, value]) => (
              <FormControl key={field}>
                <FormLabel>{field}</FormLabel>
                <Input
                  value={value}
                  onChange={(e) =>
                    setTypeValues({ ...typeValues, [field]: e.target.value })
                  }
                />
              </FormControl>
            ))}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant='ghost' onClick={resetForm} mr={2}>
            Reset
          </Button>
          <Button colorScheme='blue' onClick={handleAddType}>
            Add Type
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddObjectTypeModal;
