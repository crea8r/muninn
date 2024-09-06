import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
} from '@chakra-ui/react';
import BreadcrumbComponent from '../../components/Breadcrumb';

interface TagItem {
  id: number;
  name: string;
  description: string;
  color: string;
}

const TagsPage: React.FC = () => {
  const [tags, setTags] = useState<TagItem[]>([]);

  useEffect(() => {
    // TODO: Fetch tags from API
    const dummyTags: TagItem[] = [
      {
        id: 1,
        name: 'High Priority',
        description: 'Urgent and important items',
        color: 'red',
      },
      {
        id: 2,
        name: 'In Progress',
        description: 'Currently being worked on',
        color: 'blue',
      },
      {
        id: 3,
        name: 'Completed',
        description: 'Finished tasks or projects',
        color: 'green',
      },
    ];
    setTags(dummyTags);
  }, []);

  return (
    <Box>
      <BreadcrumbComponent />
      <HStack justify='space-between' mb={6}>
        <Heading as='h1' size='xl' color='var(--color-primary)'>
          Tags
        </Heading>
        <Button colorScheme='blue' bg='var(--color-primary)'>
          New Tag
        </Button>
      </HStack>
      <Table variant='simple'>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Description</Th>
            <Th>Color</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tags.map((tag) => (
            <Tr key={tag.id}>
              <Td>
                <Tag colorScheme={tag.color}>{tag.name}</Tag>
              </Td>
              <Td>{tag.description}</Td>
              <Td>{tag.color}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default TagsPage;
