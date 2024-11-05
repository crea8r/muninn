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
  VStack,
} from '@chakra-ui/react';
import { ObjectType } from 'src/types/';
import { MasterFormElement } from 'src/components/rich-object-form/MasterFormElement';

interface AddObjectTypeValueModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTypes: ObjectType[];
  onAddType: (payload: any) => void;
}

const AddObjectTypeValueModal: React.FC<AddObjectTypeValueModalProps> = ({
  isOpen,
  onClose,
  availableTypes,
  onAddType,
}) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [typeValues, setTypeValues] = useState<{ [key: string]: string }>({});
  const [isDirty, setIsDirty] = useState(false);

  const handleAddType = () => {
    if (!selectedType) return;
    onAddType({
      typeId: selectedType,
      values: typeValues,
    });
    setIsDirty(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedType('');
    setTypeValues({});
  };

  const handleClose = () => {
    if (isDirty) {
      if (
        window.confirm(
          'Are you sure you want to close? You have unsaved changes.'
        )
      ) {
        onClose();
        resetForm();
      }
    } else {
      onClose();
      resetForm();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
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
                  setIsDirty(true);
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
            {Object.entries(typeValues).map(([field, value]) => {
              const dataType = availableTypes.find((t) => t.id === selectedType)
                ?.fields[field];
              return (
                <MasterFormElement
                  key={field}
                  field={field}
                  dataType={dataType}
                  value={value}
                  onChange={(value) => {
                    setIsDirty(true);
                    setTypeValues({ ...typeValues, [field]: value });
                  }}
                />
              );
            })}
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

export default AddObjectTypeValueModal;
