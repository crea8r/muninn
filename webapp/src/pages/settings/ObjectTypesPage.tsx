import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Button,
  HStack,
  Badge,
  useDisclosure,
} from '@chakra-ui/react';
import ComplexFilterTable, {
  Column,
} from '../../components/ComplexFilterTable';
import BreadcrumbComponent from '../../components/Breadcrumb';
import ObjectTypeForm from '../../components/forms/ObjectTypeForm';
import { ObjectType } from '../../types/Object';

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
        fields: {
          name: 'string',
          email: 'string',
        },
      },
      {
        id: 2,
        name: 'Project',
        description: 'Represents a project or initiative',
        fields: {
          title: 'string',
          startDate: 'datetime',
          endDate: 'datetime',
          budget: 'number',
        },
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
      render: (value: { [key: string]: any }, item: ObjectType) => (
        <>
          {Object.keys(value).map((k, index) => (
            <Badge key={index} mr={2} mb={1}>
              {k}: {value[k]}
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
      <ObjectTypeForm
        isOpen={isOpen}
        onClose={onClose}
        onSave={() => {}}
        initialData={editingObjectType}
      />
    </Box>
  );
};

export default ObjectTypesPage;
