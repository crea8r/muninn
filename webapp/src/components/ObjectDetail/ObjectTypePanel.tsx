import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
} from '@chakra-ui/react';
import { ObjectType, ObjectTypeValue } from '../../types/ObjectType';
import {
  fetchObjectTypes,
  addObjectType,
  updateObjectTypeValue,
  removeObjectType,
} from '../../api';

interface ObjectTypePanelProps {
  objectId: string;
}

const ObjectTypePanel: React.FC<ObjectTypePanelProps> = ({ objectId }) => {
  const [objectTypes, setObjectTypes] = useState<ObjectTypeValue[]>([]);
  const [availableTypes, setAvailableTypes] = useState<ObjectType[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedType, setSelectedType] = useState<string>('');
  const [typeValues, setTypeValues] = useState<{ [key: string]: string }>({});
  const toast = useToast();

  useEffect(() => {
    const loadObjectTypes = async () => {
      try {
        const { objectTypes, availableTypes } = await fetchObjectTypes(
          objectId
        );
        setObjectTypes(objectTypes);
        setAvailableTypes(availableTypes);
      } catch (error) {
        toast({
          title: 'Error loading object types',
          description: 'Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    loadObjectTypes();
  }, [objectId, toast]);

  const handleAddType = async () => {
    if (!selectedType) return;

    try {
      const newObjectType = await addObjectType(
        objectId,
        selectedType,
        typeValues
      );
      setObjectTypes([...objectTypes, newObjectType]);
      onClose();
      toast({
        title: 'Object type added',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error adding object type',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpdateTypeValue = async (
    typeId: string,
    field: string,
    value: string
  ) => {
    try {
      const updatedType = await updateObjectTypeValue(
        objectId,
        typeId,
        field,
        value
      );
      setObjectTypes(
        objectTypes.map((type) =>
          type.objectTypeId === typeId ? updatedType : type
        )
      );
      toast({
        title: 'Object type value updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error updating object type value',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRemoveType = async (typeId: string) => {
    try {
      await removeObjectType(objectId, typeId);
      setObjectTypes(
        objectTypes.filter((type) => type.objectTypeId !== typeId)
      );
      toast({
        title: 'Object type removed',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error removing object type',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  console.log('availableTypes: ', availableTypes);
  return (
    <Box>
      <VStack align='stretch' spacing={4}>
        <Heading size='md'>Object Types</Heading>
        {objectTypes.map((type) => (
          <Box key={type.objectTypeId} borderWidth={1} borderRadius='md' p={4}>
            <Heading size='sm'>
              {availableTypes.filter(
                (ot: ObjectType) => ot.id === type.objectTypeId
              )[0]?.name || 'Unknown type'}
            </Heading>
            {Object.entries(type.values).map(([field, value]) => (
              <FormControl key={field} mt={2}>
                <FormLabel>{field}</FormLabel>
                <Input
                  value={value}
                  onChange={(e) =>
                    handleUpdateTypeValue(
                      type.objectTypeId,
                      field,
                      e.target.value
                    )
                  }
                />
              </FormControl>
            ))}
            <Button
              mt={2}
              colorScheme='red'
              size='sm'
              onClick={() => handleRemoveType(type.objectTypeId)}
            >
              Remove Type
            </Button>
          </Box>
        ))}
        <Button onClick={onOpen}>Add New Type</Button>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Object Type</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Select Type</FormLabel>
              <Select
                placeholder='Select type'
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
              <FormControl key={field} mt={2}>
                <FormLabel>{field}</FormLabel>
                <Input
                  value={value}
                  onChange={(e) =>
                    setTypeValues({ ...typeValues, [field]: e.target.value })
                  }
                />
              </FormControl>
            ))}
            <Button mt={4} colorScheme='blue' onClick={handleAddType}>
              Add Type
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ObjectTypePanel;
