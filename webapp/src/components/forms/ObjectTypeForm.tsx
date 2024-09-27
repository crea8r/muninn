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
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  IconButton,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { ObjectType } from 'src/types';

// Define the props for the ObjectTypeForm component
interface ObjectTypeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (objectType: ObjectType) => void;
  initialData?: ObjectType;
}

// Define the structure for a field in the ObjectType
interface Field {
  name: string;
  type: 'string' | 'number' | 'datetime';
}

const ObjectTypeForm: React.FC<ObjectTypeFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  // State to hold the form data
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<Field[]>([]);

  // Effect to populate form when editing an existing ObjectType
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
      setFields(
        Object.entries(initialData.fields).map(([key, value]) => ({
          name: key,
          type: value as Field['type'],
        }))
      );
    } else {
      // Clear form when creating a new ObjectType
      setName('');
      setDescription('');
      setFields([]);
    }
  }, [initialData, isOpen]);

  // Handler to add a new field
  const handleAddField = () => {
    setFields([...fields, { name: '', type: 'string' }]);
  };

  // Handler to update a field
  const handleFieldChange = (
    index: number,
    key: keyof Field,
    value: string
  ) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], [key]: value };
    setFields(updatedFields);
  };

  // Handler to remove a field
  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  // Handler to save the ObjectType
  const handleSave = () => {
    const objectType: ObjectType = {
      id: initialData?.id || null, // Use existing ID if editing, otherwise null for new ObjectType
      name,
      description,
      fields: Object.fromEntries(
        fields.map((field) => [field.name, field.type])
      ),
    };
    onSave(objectType);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='xl'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {initialData ? 'Edit Data Type' : 'Create Data Type'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isRequired mb={4}>
            <FormLabel>Name</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Description</FormLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Fields</FormLabel>
            <Table variant='simple'>
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Type</Th>
                  <Th width='50px'></Th>
                </Tr>
              </Thead>
              <Tbody>
                {fields.map((field, index) => (
                  <Tr key={index}>
                    <Td>
                      <Input
                        value={field.name}
                        onChange={(e) =>
                          handleFieldChange(index, 'name', e.target.value)
                        }
                      />
                    </Td>
                    <Td>
                      <Select
                        value={field.type}
                        onChange={(e) =>
                          handleFieldChange(
                            index,
                            'type',
                            e.target.value as Field['type']
                          )
                        }
                      >
                        <option value='string'>String</option>
                        <option value='number'>Number</option>
                        <option value='datetime'>Datetime</option>
                      </Select>
                    </Td>
                    <Td>
                      <IconButton
                        aria-label='Remove field'
                        icon={<DeleteIcon />}
                        onClick={() => handleRemoveField(index)}
                        size='sm'
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Button leftIcon={<AddIcon />} onClick={handleAddField} mt={2}>
              Add Field
            </Button>
          </FormControl>
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

export default ObjectTypeForm;
