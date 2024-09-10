import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  HStack,
  Link,
} from '@chakra-ui/react';
import { Link as RouterLink, useHistory } from 'react-router-dom';

interface View {
  id: number;
  name: string;
  description: string;
}

const ViewsPage: React.FC = () => {
  const [views, setViews] = useState<View[]>([]);
  const history = useHistory();

  useEffect(() => {
    // TODO: Fetch views from API
    const dummyViews: View[] = [
      { id: 1, name: 'Active Projects', description: 'All ongoing projects' },
      {
        id: 2,
        name: 'High Priority Tasks',
        description: 'Tasks marked as high priority',
      },
      {
        id: 3,
        name: 'Recent Clients',
        description: 'Clients added in the last 30 days',
      },
    ];
    setViews(dummyViews);
  }, []);

  const handleViewClick = (viewId: number) => {
    history.push(`/views/${viewId}`);
  };

  return (
    <Box>
      <HStack justify='space-between' mb={6}>
        <Heading as='h1' size='xl' color='var(--color-primary)'>
          My Views
        </Heading>
        <Button colorScheme='blue' bg='var(--color-primary)'>
          New View
        </Button>
      </HStack>
      <VStack spacing={4} align='stretch'>
        {views.map((view) => (
          <Box key={view.id} p={4} bg='white' borderRadius='md' boxShadow='sm'>
            <HStack justify='space-between'>
              <VStack align='start' spacing={1}>
                <Link
                  as={RouterLink}
                  to={`/views/${view.id}`}
                  fontWeight='bold'
                  color='var(--color-primary)'
                >
                  {view.name}
                </Link>
                <Text fontSize='sm' color='gray.500'>
                  {view.description}
                </Text>
              </VStack>
              <Button size='sm' onClick={() => handleViewClick(view.id)}>
                View Objects
              </Button>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default ViewsPage;
