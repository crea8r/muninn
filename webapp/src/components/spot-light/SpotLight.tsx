import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  VStack,
  HStack,
  Text,
  Box,
  Image,
  Flex,
  useDisclosure,
  Badge,
  Icon,
  Button,
  useToast,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpotLight, SearchFilter } from 'src/contexts/SpotLightContext';
import { debounce } from 'lodash';
import { FaAddressCard, FaFileAlt, FaTasks, FaUser } from 'react-icons/fa';
import { fetchObjects } from 'src/api/object';
import { listTasks } from 'src/api/task';
import { listOrgMembers } from 'src/api/orgMember';
import { listFact } from 'src/api/fact';
import { Object, Task, OrgMember, Fact } from 'src/types';
import authService from 'src/services/authService';
import NoImage from 'src/assets/NoImage.jpg';
import TaskItem from '../TaskItem';
import FactItem from '../FactItem';
import LoadingPanel from '../LoadingPanel';
import SearchInput from './SearchInput';

const ITEMS_PER_PAGE = 6;
const MIN_SEARCH_DELAY = 1000;

interface SearchResult {
  type: SearchFilter;
  id: string;
  name?: string;
  content?: string;
  text?: string;
  username?: string;
  profile?: { avatar: string };
}

interface FilterCount {
  object: number;
  fact: number;
  task: number;
  creator: number;
}

interface PaginationState {
  object: number;
  fact: number;
  task: number;
  creator: number;
}

export enum SpotLightFilter {
  OBJECT = 'object',
  FACT = 'fact',
  TASK = 'task',
  CREATOR = 'creator',
}

const SpotLight: React.FC = () => {
  const {
    isOpen,
    closeSpotLight,
    filters,
    activeFilter,
    setActiveFilter,
    onSelect,
  } = useSpotLight();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [paginationState, setPaginationState] = useState<PaginationState>({
    object: 1,
    fact: 1,
    task: 1,
    creator: 1,
  });
  const [totalPages, setTotalPages] = useState<PaginationState>({
    object: 1,
    fact: 1,
    task: 1,
    creator: 1,
  });
  const [filterCounts, setFilterCounts] = useState<FilterCount>({
    object: 0,
    fact: 0,
    task: 0,
    creator: 0,
  });
  const resultsRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [objectResponse, setObjectResponse] = useState<any>();
  const [factResponse, setFactResponse] = useState<any>();
  const [taskResponse, setTaskResponse] = useState<any>();
  const [creatorResponse, setCreatorResponse] = useState<any>();
  const [lastSearchTime, setLastSearchTime] = useState(0);
  const toast = useToast();

  const {
    isOpen: modalIsOpen,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure();

  const performSearch = useCallback(
    async (query: string) => {
      const now = Date.now();
      if (now - lastSearchTime < MIN_SEARCH_DELAY) {
        // Prevent searching more than once per second
        return;
      }

      setIsLoading(true);
      setLastSearchTime(now);

      try {
        const searchPromises = [];

        if (filters.includes(SpotLightFilter.OBJECT)) {
          searchPromises.push(fetchObjects(0, ITEMS_PER_PAGE, query));
        }
        if (filters.includes(SpotLightFilter.FACT)) {
          searchPromises.push(listFact(0, ITEMS_PER_PAGE, query));
        }
        if (filters.includes(SpotLightFilter.TASK)) {
          searchPromises.push(
            listTasks({
              page: 0,
              pageSize: ITEMS_PER_PAGE,
              search: query,
              status: '',
              creatorId: authService.getCreatorId() || '',
              assignedId: authService.getCreatorId() || '',
            })
          );
        }
        if (filters.includes(SpotLightFilter.CREATOR)) {
          searchPromises.push(listOrgMembers(query));
        }

        const [objectRes, factRes, taskRes, creatorRes] =
          await Promise.allSettled(searchPromises);

        if (objectRes.status === 'fulfilled')
          setObjectResponse(objectRes.value);
        if (factRes.status === 'fulfilled') setFactResponse(factRes.value);
        if (taskRes.status === 'fulfilled') setTaskResponse(taskRes.value);
        if (creatorRes.status === 'fulfilled')
          setCreatorResponse(creatorRes.value);
      } catch (error) {
        console.error('Error performing search:', error);
        toast({
          title: 'Error performing search',
          description: 'Please try again later.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [filters, lastSearchTime, toast]
  );

  useEffect(() => {
    if (isOpen) {
      openModal();
      setSearchQuery('');
      setSearchResults([]);
      setPaginationState({ object: 1, fact: 1, task: 1, creator: 1 });
    } else {
      closeModal();
    }
  }, [isOpen, openModal, closeModal]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        if (query.length < 2) {
          setSearchResults([]);
          setFilterCounts({ object: 0, fact: 0, task: 0, creator: 0 });
          return;
        }
        performSearch(query);
      }, 300),
    [performSearch]
  );

  useEffect(() => {
    // Set search results based on active filter
    let results: any[] = [];
    let totalCount = 0;

    switch (activeFilter) {
      case SpotLightFilter.OBJECT:
        results =
          objectResponse?.objects?.map((obj: Object) => ({
            type: SpotLightFilter.OBJECT,
            ...obj,
          })) || [];
        totalCount = objectResponse?.totalCount || 0;
        break;
      case SpotLightFilter.FACT:
        results =
          factResponse?.facts?.map((fact: any) => ({
            type: SpotLightFilter.FACT,
            ...fact,
          })) || [];
        totalCount = factResponse?.totalCount || 0;
        break;
      case SpotLightFilter.TASK:
        results =
          taskResponse?.tasks?.map((task: Task) => ({
            type: SpotLightFilter.TASK,
            ...task,
          })) || [];
        totalCount = taskResponse?.totalCount || 0;
        break;
      case SpotLightFilter.CREATOR:
        results =
          creatorResponse?.map((member: OrgMember) => ({
            type: SpotLightFilter.CREATOR,
            id: member.id,
            username: member.username,
            profile: { avatar: member.profile.avatar },
          })) || [];
        totalCount = creatorResponse?.length || 0;
        break;
    }
    // Update filter counts
    setFilterCounts({
      object: objectResponse?.totalCount || 0,
      fact: factResponse?.totalCount || 0,
      task: taskResponse?.totalCount || 0,
      creator: creatorResponse?.length || 0,
    });

    setSearchResults(results);
    setTotalPages((prev) => ({
      ...prev,
      [activeFilter]: Math.ceil(totalCount / ITEMS_PER_PAGE),
    }));
  }, [
    objectResponse,
    factResponse,
    taskResponse,
    creatorResponse,
    activeFilter,
    paginationState,
  ]);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const renderSearchResult = (result: any, index: number) => {
    switch (result.type) {
      case 'creator':
        return (
          <Box
            key={result.id}
            p={2}
            borderRadius='md'
            cursor='pointer'
            _hover={{ bg: 'blue.100' }}
            onClick={() => {
              onSelect({
                type: result.type,
                payload: result,
              });
            }}
          >
            <Flex alignItems='center'>
              <Image
                src={result.profile?.avatar || NoImage}
                alt={result.username}
                boxSize='40px'
                borderRadius='full'
                mr={2}
              />
              <Text>{result.username}</Text>
            </Flex>
          </Box>
        );
      case 'task':
        return (
          <TaskItem
            key={result.id}
            task={result as Task}
            handleClick={() => {}}
          />
        );
      case 'fact':
        return (
          <FactItem
            key={result.id}
            fact={result as Fact}
            handleClick={() => {}}
          />
        );
      default:
        return (
          <Box
            key={result.id}
            p={2}
            borderRadius='md'
            cursor='pointer'
            _hover={{ bg: 'blue.100' }}
            onClick={() => {
              onSelect({
                type: result.type,
                payload: result,
              });
            }}
          >
            <Text>{result.name || result.content || result.text}</Text>
          </Box>
        );
    }
  };

  const renderFilterBadges = () => {
    const filterIcons = {
      object: FaAddressCard,
      fact: FaFileAlt,
      task: FaTasks,
      creator: FaUser,
    };

    return filters.map((filter) => (
      <Badge
        key={filter}
        colorScheme={activeFilter === filter ? 'blue' : 'gray'}
        cursor='pointer'
        onClick={() => setActiveFilter(filter)}
      >
        <HStack spacing={1}>
          <Icon as={filterIcons[filter]} />
          <Text>{filter === 'creator' ? 'user' : filter}</Text>
          <Text>({filterCounts[filter]})</Text>
        </HStack>
      </Badge>
    ));
  };

  const handlePageChange = async (newPage: number) => {
    const now = Date.now();
    if (now - lastSearchTime < MIN_SEARCH_DELAY) {
      // Prevent page changes more than once per second
      return;
    }

    setPaginationState((prev) => ({ ...prev, [activeFilter]: newPage }));
    setIsLoading(true);
    setLastSearchTime(now);

    try {
      switch (activeFilter) {
        case SpotLightFilter.OBJECT:
          setObjectResponse(
            await fetchObjects(newPage, ITEMS_PER_PAGE, searchQuery)
          );
          break;
        case SpotLightFilter.FACT:
          setFactResponse(await listFact(newPage, ITEMS_PER_PAGE, searchQuery));
          break;
        case SpotLightFilter.TASK:
          setTaskResponse(
            await listTasks({
              page: newPage,
              pageSize: ITEMS_PER_PAGE,
              search: searchQuery,
              status: '',
              creatorId: authService.getCreatorId() || '',
              assignedId: authService.getCreatorId() || '',
            })
          );
          break;
      }
    } catch (error) {
      console.error('Error changing page:', error);
      toast({
        title: 'Error changing page',
        description: 'Please try again later.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={modalIsOpen || isLoading} onClose={closeSpotLight} size='xl'>
      <ModalOverlay />
      <ModalContent
        as={motion.div}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ duration: '0.3' }}
      >
        <VStack spacing={4} p={4}>
          <SearchInput
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            closeSpotLight={closeSpotLight}
          />
          {isLoading ? (
            <LoadingPanel />
          ) : (
            <>
              <HStack spacing={2} justifyContent='center'>
                {renderFilterBadges()}
              </HStack>
              <AnimatePresence>
                {searchResults?.length > 0 ? (
                  <VStack
                    ref={resultsRef}
                    spacing={2}
                    align='stretch'
                    w='100%'
                    maxH='400px'
                    overflowY='auto'
                    as={motion.div}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    {searchResults.map(renderSearchResult)}
                  </VStack>
                ) : (
                  searchQuery.length >= 2 && (
                    <Text textAlign='center' color='gray.500'>
                      No results found for the current filter.
                    </Text>
                  )
                )}
              </AnimatePresence>
              {searchResults.length > 0 &&
                activeFilter !== SpotLightFilter.CREATOR && (
                  <HStack justifyContent='space-between' w='100%'>
                    <Button
                      onClick={() =>
                        handlePageChange(
                          Math.max(paginationState[activeFilter] - 1, 1)
                        )
                      }
                      isDisabled={paginationState[activeFilter] === 1}
                    >
                      Previous
                    </Button>
                    <Text>
                      Page {paginationState[activeFilter]} of{' '}
                      {totalPages[activeFilter]}
                    </Text>
                    <Button
                      onClick={() =>
                        handlePageChange(
                          Math.min(
                            paginationState[activeFilter] + 1,
                            totalPages[activeFilter]
                          )
                        )
                      }
                      isDisabled={
                        paginationState[activeFilter] ===
                        totalPages[activeFilter]
                      }
                    >
                      Next
                    </Button>
                  </HStack>
                )}
            </>
          )}
        </VStack>
      </ModalContent>
    </Modal>
  );
};

export default SpotLight;
