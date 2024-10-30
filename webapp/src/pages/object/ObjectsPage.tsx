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
import { NewObject, Tag } from 'src/types/';
import { fetchObjects, createObject } from 'src/api/object';
import ImporterDialog from 'src/components/importer-dialog/ImporterDialog';
import { ObjectForm } from 'src/components/forms/';
import MarkdownDisplay from 'src/components/mardown/MarkdownDisplay';
import { shortenText } from 'src/utils';
import SmartImage from 'src/components/SmartImage';
import { FiGitMerge, FiRefreshCw } from 'react-icons/fi';
import queryString from 'query-string';
import debounce from 'lodash/debounce';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import { ListObjectsRow } from 'src/types/Object';

const ITEMS_PER_PAGE = 5;
const DEBOUNCE_DELAY = 300; // ms

const ObjectsPage: React.FC = () => {
  const { globalData, setGlobalPerPage } = useGlobalContext();

  const [objects, setObjects] = useState<ListObjectsRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastLoadTime, setLastLoadTime] = useState(0);
  const history = useHistory();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isCreatingObject, setIsCreatingObject] = useState(false);
  const toast = useToast();
  const params = queryString.parse(location.search);
  const [currentPage, setCurrentPage] = useState(Number(params.page) || 1);
  const [searchQuery, setSearchQuery] = useState(
    (params.query as string) || ''
  );
  const [itemsPerPage, setItemsPerPage] = useState(
    Number(params.perPage) || globalData?.perPage || ITEMS_PER_PAGE
  );

  // Parse URL params
  useEffect(() => {
    const params = queryString.parse(location.search);
    setItemsPerPage(
      Number(params.perPage) || globalData?.perPage || ITEMS_PER_PAGE
    );
    setCurrentPage(Number(params.page) || 1);
    setSearchQuery((params.query as string) || '');
    setInputValue((params.query as string) || '');
  }, [location.search, globalData?.perPage]);

  // Update URL when state changes
  const updateUrl = useCallback(
    (page: number, perPage: number, query: string) => {
      const currentParams = queryString.parse(location.search);
      const newParams = {
        ...currentParams,
        page: String(page),
        perPage: String(perPage),
        query,
      };
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
        setItemsPerPage(itemsPerPage);
        updateUrl(1, itemsPerPage, query);
      }, DEBOUNCE_DELAY),
    [updateUrl, itemsPerPage]
  );

  // Load objects with fail-safe
  const loadObjects = useCallback(async () => {
    const now = Date.now();
    if (now - lastLoadTime < 1000) {
      if (globalData && itemsPerPage !== globalData?.perPage) {
        // make an exception for perPage change
      } else {
        // Prevent loading more than once per second
        return;
      }
    }

    setIsLoading(true);
    setLastLoadTime(now);
    const defaultPerPage = globalData?.perPage || itemsPerPage;
    try {
      const { objects, totalCount } = await fetchObjects(
        currentPage,
        defaultPerPage,
        searchQuery
      );
      setObjects(objects);
      setTotalCount(totalCount);
    } catch (error) {
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
  }, [itemsPerPage, currentPage, searchQuery, lastLoadTime, toast, globalData]);

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
      updateUrl(newPage, itemsPerPage, searchQuery);
    },
    [searchQuery, itemsPerPage, updateUrl]
  );

  const handlePerPageChange = useCallback(
    (perPage: number) => {
      console.log('perPage', perPage);
      setItemsPerPage(perPage);
      setGlobalPerPage(perPage);
      updateUrl(1, perPage, searchQuery);
    },
    [searchQuery, updateUrl, setGlobalPerPage]
  );

  const handleAddNewObject = async (data: NewObject) => {
    try {
      const newObject = await createObject(data);
      history.push('/objects/' + newObject.id);
    } catch (e) {
      toast({
        title: 'Error creating object',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <Box height='100%' display='flex' flexDirection='column'>
      <Box px={2}>
        <Flex
          justify='space-between'
          mb={4}
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
            <IconButton
              aria-label='Merge objects'
              icon={<FiGitMerge />}
              onClick={() => history.push('/merge')}
            />
          </HStack>
        </Flex>

        <InputGroup mb={2}>
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

      <Box flex='1' overflowY='auto' px={2}>
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
            objects.map((obj) => <ObjectRow key={obj.id} obj={obj} />)
          ) : (
            <Flex justifyContent='center' alignItems='center' py={8}>
              <Text>No objects found. Try adjusting your search.</Text>
            </Flex>
          )}
        </Flex>
      </Box>

      <Flex justifyContent='space-between' alignItems='center' p={2}>
        <Text
          display={{
            base: 'none',
            md: 'block',
          }}
        >
          {(currentPage - 1) * itemsPerPage + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
        </Text>
        <HStack>
          <Select
            onChange={(e) => handlePerPageChange(parseInt(e.target.value))}
            value={itemsPerPage}
            isDisabled={isLoading}
          >
            <option value={5}>5 items per Page</option>
            <option value={10}>10 items per Page</option>
            <option value={20}>20 items per Page</option>
            <option value={50}>50 items per Page</option>
          </Select>
          <IconButton
            icon={<FaChevronLeft />}
            aria-label='Previous page'
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            isDisabled={currentPage === 1 || isLoading}
          />
          <Select
            value={currentPage}
            onChange={(e) => handlePageChange(Number(e.target.value))}
            isDisabled={isLoading}
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <option key={page} value={page}>
                {page}
              </option>
            ))}
          </Select>
          <IconButton
            icon={<FaChevronRight />}
            aria-label='Next page'
            onClick={() =>
              handlePageChange(Math.min(currentPage + 1, totalPages))
            }
            isDisabled={currentPage === totalPages || isLoading}
          />
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
const ObjectRow: React.FC<{ obj: ListObjectsRow }> = React.memo(({ obj }) => {
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
  let reason = '';
  switch (obj.matchSource) {
    case 'object_content':
      reason = obj.objHeadline;
      break;
    case 'type_values':
      reason = obj.typeValueHeadline;
      break;
    case 'related_facts':
      reason = obj.factHeadline;
      break;
    default:
      break;
  }
  return (
    <Flex
      _hover={{ bg: 'gray.100' }}
      p={2}
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
          <Box style={{ borderRadius: '100%', overflow: 'hidden' }}>
            <SmartImage
              src={imgUrls}
              alt={obj.name}
              style={{ height: '32px' }}
            />
          </Box>
        )}
        <Link
          to={`/objects/${obj.id}`}
          style={{
            textDecoration: 'underline',
            color: 'var(--color-primary)',
          }}
        >
          <Text>{shortenText(obj.name, 25)}</Text>
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
      <Box width={{ base: '100%', md: '40%' }}>
        <Text>{type_values}</Text>
        <div
          dangerouslySetInnerHTML={{ __html: reason }}
          style={{ fontWeight: 'lighter' }}
        />
      </Box>
    </Flex>
  );
});

export default ObjectsPage;
