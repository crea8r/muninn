import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Button,
  HStack,
  Tag as ChakraTag,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Select,
  Spinner,
  useDisclosure,
  Text,
  IconButton,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useHistory } from 'react-router-dom';
import { NewObject, Object, Tag } from 'src/types/';
import { fetchObjects } from 'src/api/object';
import ImporterDialog from 'src/components/importer-dialog/ImporterDialog';
import { ObjectForm } from 'src/components/forms/';
import { createObject } from 'src/api/object';
import MarkdownDisplay from 'src/components/mardown/MarkdownDisplay';
import { shortenText } from 'src/utils';
import SmartImage from 'src/components/SmartImage';
import { FiRefreshCw } from 'react-icons/fi';

const ITEMS_PER_PAGE = 10;

const ObjectsPage: React.FC = () => {
  const [objects, setObjects] = useState<Object[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  // const [objectTypeValues, setObjectTypeValues] = useState<{
  //   [key: string]: ObjectTypeValue[];
  // }>({});
  const history = useHistory();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isCreatingObject, setIsCreatingObject] = useState(false);

  useEffect(() => {
    loadObjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, forceUpdate]);

  const loadObjects = async () => {
    setIsLoading(true);
    try {
      const { objects, totalCount } = await fetchObjects(
        currentPage,
        ITEMS_PER_PAGE,
        searchQuery
      );
      setObjects(objects);
      setTotalCount(totalCount);
    } catch (error) {
      console.error('Error loading objects:', error);
    }
    setIsLoading(false);
  };

  const handleRowClick = (objectId: string) => {
    history.push(`/objects/${objectId}`);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleAddNewObject = async (data: NewObject) => {
    try {
      const newObject = await createObject(data);
      history.push('/objects/' + newObject.id);
    } catch (e) {
      throw e;
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <Box height='100%' display='flex' flexDirection='column'>
      <Box p={4}>
        <HStack justify='space-between' mb={6}>
          <Heading as='h1' size='xl' color='var(--color-primary)'>
            All Contacts ({totalCount})
          </Heading>
          <HStack>
            <Button colorScheme='green' onClick={onOpen}>
              Import CSV
            </Button>
            <Button
              colorScheme='blue'
              bg='var(--color-primary)'
              onClick={() => {
                setIsCreatingObject(true);
              }}
            >
              New Contact
            </Button>
            <IconButton
              aria-label='Refresh'
              icon={<FiRefreshCw />}
              onClick={() => setForceUpdate(forceUpdate + 1)}
            />
          </HStack>
        </HStack>

        <InputGroup mb={4}>
          <InputLeftElement pointerEvents='none'>
            <SearchIcon color='gray.300' />
          </InputLeftElement>
          <Input
            placeholder='Search objects...'
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </InputGroup>
      </Box>

      <Box flex='1' overflowY='auto' px={4}>
        <Table variant='simple'>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Description</Th>
              <Th>Type Values</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr>
                <Td colSpan={3} textAlign='center'>
                  <Spinner />
                </Td>
              </Tr>
            ) : objects.length > 0 ? (
              objects.map((obj) => {
                let str: string[] = [];
                let imgUrls: any[] = [];
                obj.typeValues.map((otv) => {
                  return window.Object.entries(otv.type_values).forEach(
                    ([_, value]) => {
                      if (
                        value &&
                        (value.includes('http://') ||
                          value.includes('https://'))
                      ) {
                        imgUrls.push(value);
                      }
                      if (
                        value &&
                        !(
                          value.includes('http') || value.includes('https://')
                        ) &&
                        value !== ''
                      ) {
                        str.push(`${value}`);
                      }
                    }
                  );
                });
                let type_values = str.join(', ') || 'No type values';
                type_values =
                  type_values.length > 50
                    ? type_values.slice(0, 50) + '...'
                    : type_values;
                return (
                  <Tr
                    key={obj.id}
                    onClick={() => handleRowClick(obj.id)}
                    _hover={{ bg: 'gray.100', cursor: 'pointer' }}
                  >
                    <Td>
                      <HStack>
                        {imgUrls.length > 0 ? (
                          <SmartImage
                            src={imgUrls}
                            alt={obj.name}
                            style={{ height: '32px' }}
                          />
                        ) : null}
                        <Text>{shortenText(obj.name, 50)}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Box mb={1}>
                        <MarkdownDisplay
                          content={shortenText(obj.description, 50)}
                        />
                      </Box>
                      {obj.tags.length > 0 && (
                        <Box>
                          {obj.tags.map((tag: Tag) => (
                            <ChakraTag
                              key={tag.id}
                              title={tag.description}
                              textColor={tag.color_schema.text}
                              background={tag.color_schema.background}
                              mr={1}
                            >
                              {tag.name}
                            </ChakraTag>
                          ))}
                        </Box>
                      )}
                    </Td>
                    <Td>{type_values}</Td>
                  </Tr>
                );
              })
            ) : (
              <Tr>
                <Td colSpan={3} textAlign='center'>
                  No objects found, try to search with a full word
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      <Flex justifyContent='space-between' alignItems='center' p={4}>
        <Box>
          Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
          {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount}{' '}
          contact
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <option key={page} value={page}>
                Page {page}
              </option>
            ))}
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

      <ImporterDialog isOpen={isOpen} onClose={onClose} />
      <ObjectForm
        isOpen={isCreatingObject}
        onClose={() => setIsCreatingObject(false)}
        onCreateObject={handleAddNewObject}
      />
    </Box>
  );
};

export default ObjectsPage;
