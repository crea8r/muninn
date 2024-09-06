import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Tag,
} from '@chakra-ui/react';
import ComplexFilterTable, { Column } from '../components/ComplexFilterTable';
import BreadcrumbComponent from '../components/Breadcrumb';

interface View {
  id: number;
  name: string;
  description: string;
  filter_setting: {
    [key: string]: any;
  };
}

interface Object {
  id: number;
  name: string;
  type: string;
  tags: string[];
}

const ViewDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [view, setView] = useState<View | null>(null);
  const [objects, setObjects] = useState<Object[]>([]);

  useEffect(() => {
    // TODO: Fetch view details from API
    const dummyView: View = {
      id: parseInt(id),
      name: 'Sample View',
      description: 'This is a sample view description.',
      filter_setting: {
        type: ['Contact', 'Project'],
        tags: ['Active'],
      },
    };
    setView(dummyView);

    // TODO: Fetch filtered objects based on view's filter_setting
    const dummyObjects: Object[] = [
      { id: 1, name: 'John Doe', type: 'Contact', tags: ['Active', 'Client'] },
      {
        id: 2,
        name: 'Project X',
        type: 'Project',
        tags: ['Active', 'High Priority'],
      },
    ];
    setObjects(dummyObjects);
  }, [id]);

  const handleObjectClick = (objectId: number) => {
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
        <Button size='sm' onClick={() => handleObjectClick(id)}>
          View Details
        </Button>
      ),
    },
  ];

  if (!view) {
    return <Text>Loading...</Text>;
  }

  return (
    <Box>
      <BreadcrumbComponent />
      <HStack justify='space-between' mb={6}>
        <Heading as='h1' size='xl' color='var(--color-primary)'>
          {view.name}
        </Heading>
        <Button onClick={() => history.push('/views')}>Back to My Views</Button>
      </HStack>
      <Text mb={4}>{view.description}</Text>
      <VStack align='stretch' spacing={4} mb={6}>
        <Heading as='h2' size='md'>
          Filter Settings
        </Heading>
        {Object.entries(view.filter_setting).map(([key, value]) => (
          <HStack key={key}>
            <Text fontWeight='bold'>{key}:</Text>
            <Text>{Array.isArray(value) ? value.join(', ') : value}</Text>
          </HStack>
        ))}
      </VStack>
      <Heading as='h2' size='lg' mb={4}>
        Objects in this View
      </Heading>
      <ComplexFilterTable data={objects} columns={columns} itemsPerPage={10} />
    </Box>
  );
};

export default ViewDetailPage;
