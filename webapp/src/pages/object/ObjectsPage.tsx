import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Heading,
  Button,
  HStack,
  Tag as ChakraTag,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  Select,
  Spinner,
  useDisclosure,
  Text,
  IconButton,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { NewObject, Object, Tag } from 'src/types/';
import { fetchObjects, createObject } from 'src/api/object';
import ImporterDialog from 'src/components/importer-dialog/ImporterDialog';
import { ObjectForm } from 'src/components/forms/';
import MarkdownDisplay from 'src/components/mardown/MarkdownDisplay';
import { shortenText } from 'src/utils';
import SmartImage from 'src/components/SmartImage';
import { FiRefreshCw } from 'react-icons/fi';
import queryString from 'query-string';
import debounce from 'lodash/debounce';

const ITEMS_PER_PAGE = 10;
const DEBOUNCE_DELAY = 300; // ms

const ObjectsPage: React.FC = () => {
  const [objects, setObjects] = useState<Object[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastLoadTime, setLastLoadTime] = useState(0);
  const history = useHistory();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isCreatingObject, setIsCreatingObject] = useState(false);
  const toast = useToast();

  // Parse URL params
  useEffect(() => {
    const params = queryString.parse(location.search);
    setCurrentPage(Number(params.page) || 1);
    setSearchQuery((params.query as string) || '');
    setInputValue((params.query as string) || '');
  }, [location.search]);

  // Update URL when state changes
  const updateUrl = useCallback(
    (page: number, query: string) => {
      const currentParams = queryString.parse(location.search);
      const newParams = { ...currentParams, page: String(page), query };
      const search = queryString.stringify(newParams);

      if (search !== location.search) {
        history.push({ search });
      }
    },
    [history, location.search]
  );

  // Debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
        updateUrl(1, query);
      }, DEBOUNCE_DELAY),
    [updateUrl]
  );

  // Load objects with fail-safe
  const loadObjects = useCallback(async () => {
    const now = Date.now();
    if (now - lastLoadTime < 1000) {
      // Prevent loading more than once per second
      return;
    }

    setIsLoading(true);
    setLastLoadTime(now);

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
      toast({
        title: 'Error loading objects',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, lastLoadTime, toast]);

  // Load objects when page or search query changes
  useEffect(() => {
    loadObjects();
  }, [loadObjects]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    debouncedSearch(newValue);
  };

  const handlePageChange = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);
      updateUrl(newPage, searchQuery);
    },
    [searchQuery, updateUrl]
  );

  const handleAddNewObject = async (data: NewObject) => {
    try {
      const newObject = await createObject(data);
      history.push('/objects/' + newObject.id);
    } catch (e) {
      console.error('Error creating object:', e);
      toast({
        title: 'Error creating object',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <Box height='100%' display='flex' flexDirection='column'>
      <Box p={4}>
        <Flex
          justify='space-between'
          mb={6}
          direction={{
            base: 'column',
            md: 'row',
          }}
        >
          <Heading
            as='h1'
            size='xl'
            color='var(--color-primary)'
            mb={{
              base: 4,
              md: 0,
            }}
          >
            All Contacts ({totalCount})
          </Heading>
          <HStack>
            <Button colorScheme='green' onClick={onOpen}>
              Import CSV
            </Button>
            <Button
              colorScheme='blue'
              bg='var(--color-primary)'
              onClick={() => setIsCreatingObject(true)}
            >
              New Contact
            </Button>
            <IconButton
              aria-label='Refresh'
              icon={<FiRefreshCw />}
              onClick={loadObjects}
            />
          </HStack>
        </Flex>

        <InputGroup mb={4}>
          <InputLeftElement pointerEvents='none'>
            <SearchIcon color='gray.300' />
          </InputLeftElement>
          <Input
            placeholder='Search objects...'
            value={inputValue}
            onChange={handleSearchChange}
          />
        </InputGroup>
      </Box>

      <Box flex='1' overflowY='auto' px={4}>
        <Flex direction='column' gap={4}>
          <Flex width={'100%'} fontWeight={'bold'}>
            <Box width={'20%'}>Name</Box>
            <Box width={'39%'} pl={2}>
              Description
            </Box>
            <Box width={'40%'}>Details</Box>
          </Flex>
          {isLoading ? (
            <Flex
              width={'100%'}
              justifyContent='center'
              alignItems='center'
              py={8}
            >
              <Spinner size='xl' />
            </Flex>
          ) : objects.length > 0 ? (
            objects.map((obj) => (
              <ObjectRow
                key={obj.id}
                obj={obj}
                onRowClick={() => history.push(`/objects/${obj.id}`)}
              />
            ))
          ) : (
            <Flex justifyContent='center' alignItems='center' py={8}>
              <Text>No objects found. Try adjusting your search.</Text>
            </Flex>
          )}
        </Flex>
      </Box>

      <Flex justifyContent='space-between' alignItems='center' p={4}>
        <Text>
          {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
          {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount}
        </Text>
        <HStack>
          <Button
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1 || isLoading}
          >
            Previous
          </Button>
          <Select
            value={currentPage}
            onChange={(e) => handlePageChange(Number(e.target.value))}
            disabled={isLoading}
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <option key={page} value={page}>
                Page {page}
              </option>
            ))}
          </Select>
          <Button
            onClick={() =>
              handlePageChange(Math.min(currentPage + 1, totalPages))
            }
            disabled={currentPage === totalPages || isLoading}
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

// Separate component for rendering each object row
const ObjectRow: React.FC<{ obj: Object; onRowClick: () => void }> = React.memo(
  ({ obj, onRowClick }) => {
    let str: string[] = [];
    let imgUrls: string[] = [];
    obj.typeValues.forEach((otv) => {
      window.Object.entries(otv.type_values).forEach(([_, value]) => {
        if (typeof value === 'string') {
          if (value.startsWith('http://') || value.startsWith('https://')) {
            imgUrls.push(value);
          } else if (value !== '') {
            str.push(value);
          }
        }
      });
    });
    let type_values = shortenText(str.join(', ') || 'No type values', 50);

    return (
      <Flex
        onClick={onRowClick}
        _hover={{ bg: 'gray.100', cursor: 'pointer' }}
        p={4}
        borderWidth={1}
        borderRadius={'md'}
        alignItems={'left'}
        justifyContent={'space-between'}
        direction={{
          base: 'column',
          md: 'row',
        }}
      >
        <HStack width={{ base: '100%', md: '20%' }} overflow={'clip'}>
          {imgUrls.length > 0 && (
            <SmartImage
              src={imgUrls}
              alt={obj.name}
              style={{ height: '32px' }}
            />
          )}
          <Link
            to={`/objects/${obj.id}`}
            style={{
              textDecoration: 'underline',
              color: 'var(--color-primary)',
            }}
          >
            <Text>{shortenText(obj.name, 15)}</Text>
          </Link>
        </HStack>
        <VStack width={{ base: '100%', md: '40%' }} pr={1}>
          <MarkdownDisplay
            content={obj.description}
            characterLimit={100}
            style={{ width: '100%' }}
          />
          {obj.tags.length > 0 && (
            <Box alignItems={'left'} width='100%' mb={1} mt={'-16px'}>
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
        </VStack>
        <Box width={{ base: '100%', md: '40%' }}>{type_values}</Box>
      </Flex>
    );
  }
);

export default ObjectsPage;
