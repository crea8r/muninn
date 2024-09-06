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

interface List {
  id: number;
  name: string;
  description: string;
  filters: string[];
}

const ListForm: React.FC<{
  list?: List;
  onSave: (list: List) => void;
  onClose: () => void;
}> = ({ list, onSave, onClose }) => {
  const [name, setName] = useState(list?.name || '');
  const [description, setDescription] = useState(list?.description || '');
  const [filters, setFilters] = useState<string>(
    list?.filters.join('\n') || ''
  );

  const handleSave = () => {
    onSave({
      id: list?.id || Date.now(),
      name,
      description,
      filters: filters.split('\n').filter((filter) => filter.trim() !== ''),
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
        <FormLabel>Filters (one per line)</FormLabel>
        <Textarea
          value={filters}
          onChange={(e) => setFilters(e.target.value)}
        />
      </FormControl>
      <Button colorScheme='blue' onClick={handleSave}>
        Save
      </Button>
    </VStack>
  );
};

const ListsPage: React.FC = () => {
  const [lists, setLists] = useState<List[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingList, setEditingList] = useState<List | undefined>(undefined);

  useEffect(() => {
    // TODO: Fetch lists from API
    const dummyLists: List[] = [
      {
        id: 1,
        name: 'Active Clients',
        description: 'All current active clients',
        filters: ['Type: Client', 'Status: Active'],
      },
      {
        id: 2,
        name: 'High Priority Projects',
        description: 'Projects marked as high priority',
        filters: ['Type: Project', 'Priority: High'],
      },
    ];
    setLists(dummyLists);
  }, []);

  const handleSave = (list: List) => {
    if (editingList) {
      setLists(lists.map((l) => (l.id === list.id ? list : l)));
    } else {
      setLists([...lists, list]);
    }
    setEditingList(undefined);
    onClose();
  };

  const handleEdit = (list: List) => {
    setEditingList(list);
    onOpen();
  };

  const handleNew = () => {
    setEditingList(undefined);
    onOpen();
  };

  const columns: Column<List>[] = [
    { key: 'name', header: 'Name', sortable: true, filterable: true },
    {
      key: 'description',
      header: 'Description',
      sortable: true,
      filterable: true,
    },
    {
      key: 'filters',
      header: 'Filters',
      render: (value: string[], item: List) => (
        <>
          {value.map((filter, index) => (
            <Badge key={index} mr={2} mb={1}>
              {filter}
            </Badge>
          ))}
        </>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (value: number, item: List) => (
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
          Lists
        </Heading>
        <Button
          colorScheme='blue'
          bg='var(--color-primary)'
          onClick={handleNew}
        >
          New List
        </Button>
      </HStack>
      <ComplexFilterTable data={lists} columns={columns} itemsPerPage={5} />
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingList ? 'Edit List' : 'New List'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ListForm
              list={editingList}
              onSave={handleSave}
              onClose={onClose}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ListsPage;
