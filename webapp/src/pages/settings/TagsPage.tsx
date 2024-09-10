import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Button,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag as ChakraTag,
  useDisclosure,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  Select,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import BreadcrumbComponent from '../../components/Breadcrumb';
import NewTagForm from '../../components/forms/NewTagForm';

interface Tag {
  id: number;
  name: string;
  description: string;
  color_schema: {
    background: string;
    text: string;
  };
}

const ITEMS_PER_PAGE = 10;

const TagsPage: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    const filtered = tags.filter(
      (tag) =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tag.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTags(filtered);
    setCurrentPage(1);
  }, [tags, searchQuery]);

  const fetchTags = async () => {
    // TODO: Replace with actual API call
    const dummyTags: Tag[] = [
      // ... (previous dummy data)
    ];
    // Generate more dummy data for pagination demo
    for (let i = 4; i <= 50; i++) {
      dummyTags.push({
        id: i,
        name: `Tag ${i}`,
        description: `Description for Tag ${i}`,
        color_schema: {
          background: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
          text: '#000000',
        },
      });
    }
    setTags(dummyTags);
  };

  const handleAddTag = async (newTag: Omit<Tag, 'id'>) => {
    // TODO: Replace with actual API call
    const tagWithId = { ...newTag, id: Date.now() };
    setTags([...tags, tagWithId]);
    onClose();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const totalPages = Math.ceil(filteredTags.length / ITEMS_PER_PAGE);
  const paginatedTags = filteredTags.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Flex direction='column' height='100%'>
      <Box mb={6}>
        <BreadcrumbComponent />
        <HStack justify='space-between' mb={6}>
          <Heading as='h1' size='xl' color='var(--color-primary)'>
            Tags
          </Heading>
          <Button colorScheme='blue' bg='var(--color-primary)' onClick={onOpen}>
            New Tag
          </Button>
        </HStack>

        <InputGroup mb={4}>
          <InputLeftElement pointerEvents='none'>
            <SearchIcon color='gray.300' />
          </InputLeftElement>
          <Input
            placeholder='Search tags...'
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </InputGroup>
      </Box>

      <Box flex='1' overflow='auto'>
        <Table variant='simple'>
          <Thead position='sticky' top={0} bg='white' zIndex={1}>
            <Tr>
              <Th>Name</Th>
              <Th>Description</Th>
            </Tr>
          </Thead>
          <Tbody>
            {paginatedTags.map((tag) => (
              <Tr key={tag.id}>
                <Td>
                  <ChakraTag
                    backgroundColor={tag.color_schema.background}
                    color={tag.color_schema.text}
                  >
                    {tag.name}
                  </ChakraTag>
                </Td>
                <Td>{tag.description}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Box mt={4}>
        <Flex justifyContent='space-between' alignItems='center'>
          <Box>
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredTags.length)} of{' '}
            {filteredTags.length} tags
          </Box>
          <HStack>
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Select
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <option key={page} value={page}>
                    Page {page}
                  </option>
                )
              )}
            </Select>
            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </HStack>
        </Flex>
      </Box>

      <NewTagForm
        isOpen={isOpen}
        onClose={onClose}
        onAddTag={handleAddTag}
        existingTags={tags}
      />
    </Flex>
  );
};

export default TagsPage;
