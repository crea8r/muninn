import React, { useState, useEffect } from 'react';
import {
  Box,
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
  useToast,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import BreadcrumbComponent from 'src/components/Breadcrumb';
import { NewTagForm, EditTagForm } from 'src/components/forms';
import {
  listTags,
  createTag,
  updateTag,
  deleteTag,
  ListTagsParams,
  UpdateTagParams,
} from 'src/api/tag';
import { Tag } from 'src/types';
import LoadingPanel from 'src/components/LoadingPanel';

const ITEMS_PER_PAGE = 6;

const TagsPage: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const {
    isOpen: isNewTagOpen,
    onOpen: onNewTagOpen,
    onClose: onNewTagClose,
  } = useDisclosure();
  const {
    isOpen: isEditTagOpen,
    onOpen: onEditTagOpen,
    onClose: onEditTagClose,
  } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery]);

  const fetchTags = async () => {
    setIsLoading(true);
    try {
      const params: ListTagsParams = {
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
        query: searchQuery,
      };
      const response = await listTags(params);
      setTags(response.tags || []);
      setTotalCount(response.totalCount);
    } catch (error) {
      toast({
        title: 'Error fetching tags',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    setIsLoading(false);
  };

  const handleAddTag = async (newTag: Omit<Tag, 'id'>) => {
    try {
      await createTag(newTag);
      fetchTags();
      onNewTagClose();
      toast({
        title: 'Tag created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error creating tag',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpdateTag = async (id: string, updatedTag: UpdateTagParams) => {
    try {
      await updateTag(id, updatedTag);
      fetchTags();
      onEditTagClose();
      toast({
        title: 'Tag updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error updating tag',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteTag = async (id: string) => {
    try {
      await deleteTag(id);
      fetchTags();
      toast({
        title: 'Tag deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error deleting tag',
        description:
          'The tag might be in use or you may not have permission to delete it.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleEditClick = (tag: Tag) => {
    setSelectedTag(tag);
    onEditTagOpen();
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <Box>
      <BreadcrumbComponent />
      <HStack justify='space-between' mb={6}>
        <Heading as='h1' size='xl' color='var(--color-primary)'>
          Tags
        </Heading>
        <Button
          colorScheme='blue'
          bg='var(--color-primary)'
          onClick={onNewTagOpen}
          isDisabled={isLoading}
        >
          New Tag
        </Button>
      </HStack>

      <InputGroup mb={4}>
        <InputLeftElement pointerEvents='none'>
          <SearchIcon color='gray.300' />
        </InputLeftElement>
        <Input
          placeholder='Search in name and description'
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </InputGroup>

      {isLoading ? (
        <LoadingPanel />
      ) : (
        <>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Description</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tags.map((tag) => (
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
                  <Td>
                    <Button
                      size='sm'
                      mr={2}
                      onClick={() => handleEditClick(tag)}
                    >
                      Edit
                    </Button>
                    <Button
                      size='sm'
                      colorScheme='red'
                      onClick={() => handleDeleteTag(tag.id.toString())}
                    >
                      Delete
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          <Flex justifyContent='space-between' alignItems='center' mt={4}>
            <Box>
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, totalCount || 0)} of{' '}
              {totalCount || 0} tags
            </Box>
            <HStack>
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                isLoading={isLoading}
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
                isLoading={isLoading}
              >
                Next
              </Button>
            </HStack>
          </Flex>
        </>
      )}

      <NewTagForm
        isOpen={isNewTagOpen}
        onClose={onNewTagClose}
        onAddTag={handleAddTag}
        existingTags={tags}
      />

      {selectedTag && (
        <EditTagForm
          isOpen={isEditTagOpen}
          onClose={onEditTagClose}
          onEditTag={handleUpdateTag}
          tag={selectedTag}
        />
      )}
    </Box>
  );
};

export default TagsPage;
