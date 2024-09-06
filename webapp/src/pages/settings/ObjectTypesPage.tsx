import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Button,
  HStack,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
} from '@chakra-ui/react';
import ComplexFilterTable, {
  Column,
} from '../../components/ComplexFilterTable';
import BreadcrumbComponent from '../../components/Breadcrumb';

interface ObjectType {
  id: number;
  name: string;
  description: string;
  fields: { name: string; type: string }[];
}

const ObjectTypeForm: React.FC<{
  objectType?: ObjectType;
  onSave: (objectType: ObjectType) => void;
  onClose: () => void;
}> = ({ objectType, onSave, onClose }) => {
  const [name, setName] = useState(objectType?.name || '');
  const [description, setDescription] = useState(objectType?.description || '');
  const [fields, setFields] = useState<string>(
    objectType?.fields.map((f) => `${f.name}:${f.type}`).join('\n') || ''
  );

  const handleSave = () => {
    onSave({
      id: objectType?.id || Date.now(),
      name,
      description,
      fields: fields.split('\n').map((field) => {
        const [name, type] = field.split(':');
        return { name: name.trim(), type: type.trim() };
      }),
    });
    onClose();
  };

  return (
    <VStack spacing={4}>
      <FormControl>
        <FormLabel>Name</FormLabel>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </FormControl>
      <FormControl>
        <FormLabel>Description</FormLabel>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Fields (one per line, format: name:type)</FormLabel>
        <Textarea value={fields} onChange={(e) => setFields(e.target.value)} />
      </FormControl>
      <Button colorScheme='blue' onClick={handleSave}>
        Save
      </Button>
    </VStack>
  );
};

const ObjectTypesPage: React.FC = () => {
  const [objectTypes, setObjectTypes] = useState<ObjectType[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingObjectType, setEditingObjectType] = useState<
    ObjectType | undefined
  >(undefined);

  useEffect(() => {
    // TODO: Fetch object types from API
    const dummyObjectTypes: ObjectType[] = [
      {
        id: 1,
        name: 'Contact',
        description: 'Represents a person or company',
        fields: [
          { name: 'Name', type: 'string' },
          { name: 'Email', type: 'string' },
          { name: 'Phone', type: 'string' },
        ],
      },
      {
        id: 2,
        name: 'Project',
        description: 'Represents a project or initiative',
        fields: [
          { name: 'Title', type: 'string' },
          { name: 'Start Date', type: 'date' },
          { name: 'End Date', type: 'date' },
          { name: 'Budget', type: 'number' },
        ],
      },
    ];
    setObjectTypes(dummyObjectTypes);
  }, []);

  const handleSave = (objectType: ObjectType) => {
    if (editingObjectType) {
      setObjectTypes(
        objectTypes.map((ot) => (ot.id === objectType.id ? objectType : ot))
      );
    } else {
      setObjectTypes([...objectTypes, objectType]);
    }
    setEditingObjectType(undefined);
    onClose();
  };

  const handleEdit = (objectType: ObjectType) => {
    setEditingObjectType(objectType);
    onOpen();
  };

  const handleNew = () => {
    setEditingObjectType(undefined);
    onOpen();
  };

  const columns: Column<ObjectType>[] = [
    { key: 'name', header: 'Name', sortable: true, filterable: true },
    {
      key: 'description',
      header: 'Description',
      sortable: true,
      filterable: true,
    },
    {
      key: 'fields',
      header: 'Fields',
      render: (value: { name: string; type: string }[], item: ObjectType) => (
        <>
          {value.map((field, index) => (
            <Badge key={index} mr={2} mb={1}>
              {field.name}: {field.type}
            </Badge>
          ))}
        </>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (value: number, item: ObjectType) => (
        <Button size='sm' onClick={() => handleEdit(item)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <BreadcrumbComponent />
      <HStack justify='space-between' mb={6}>
        <Heading as='h1' size='xl' color='var(--color-primary)'>
          Object Types
        </Heading>
        <Button
          colorScheme='blue'
          bg='var(--color-primary)'
          onClick={handleNew}
        >
          New Object Type
        </Button>
      </HStack>
      <ComplexFilterTable
        data={objectTypes}
        columns={columns}
        itemsPerPage={5}
      />
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingObjectType ? 'Edit Object Type' : 'New Object Type'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ObjectTypeForm
              objectType={editingObjectType}
              onSave={handleSave}
              onClose={onClose}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ObjectTypesPage;
