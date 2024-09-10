import React, { useState, useEffect } from 'react';
import { Box, Heading, Button, HStack, Tag, VStack } from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';
import ComplexFilterTable, {
  Column,
} from '../../components/ComplexFilterTable';
import ImporterDialog from '../../components/ImporterDialog';

interface Object {
  id: number;
  name: string;
  type: string;
  tags: string[];
}

const ObjectsPage: React.FC = () => {
  const [objects, setObjects] = useState<Object[]>([]);
  const history = useHistory();

  useEffect(() => {
    // TODO: Fetch objects from API
    const dummyObjects: Object[] = [
      { id: 1, name: 'John Doe', type: 'Contact', tags: ['Client', 'VIP'] },
      {
        id: 2,
        name: 'Project X',
        type: 'Project',
        tags: ['Active', 'High Priority'],
      },
      {
        id: 3,
        name: 'Sales Report Q2',
        type: 'Document',
        tags: ['Report', 'Quarterly'],
      },
    ];
    setObjects(dummyObjects);
  }, []);

  const handleViewDetails = (objectId: number) => {
    history.push(`/objects/${objectId}`);
  };

  const columns: Column<Object>[] = [
    { key: 'name', header: 'Name', sortable: true, filterable: true },
    { key: 'type', header: 'Type', sortable: true, filterable: true },
    {
      key: 'tags',
      header: 'Tags',
      render: (tags: string[]) => (
        <>
          {tags.map((tag, index) => (
            <Tag key={index} mr={2} mb={1}>
              {tag}
            </Tag>
          ))}
        </>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (id: number) => (
        <Button size='sm' onClick={() => handleViewDetails(id)}>
          View Details
        </Button>
      ),
    },
  ];

  const [isImporterDialogOpen, setIsImporterDialogOpen] = useState(false);
  const toggleImporterDialog = () => {
    setIsImporterDialogOpen(!isImporterDialogOpen);
  };

  return (
    <Box>
      <HStack justify='space-between' mb={6}>
        <Heading as='h1' size='xl' color='var(--color-primary)'>
          All Objects
        </Heading>
        <HStack>
          <Button colorScheme='green' onClick={toggleImporterDialog}>
            Import CSV
          </Button>
          <Button colorScheme='blue' bg='var(--color-primary)'>
            New Object
          </Button>
        </HStack>
      </HStack>
      <ComplexFilterTable data={objects} columns={columns} itemsPerPage={10} />
      <ImporterDialog
        isOpen={isImporterDialogOpen}
        onClose={toggleImporterDialog}
      />
    </Box>
  );
};

export default ObjectsPage;
