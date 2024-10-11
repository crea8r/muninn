import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  Input,
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
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpotLight, SearchFilter } from 'src/contexts/SpotLightContext';
import { debounce } from 'lodash';
import {
  FaSearch,
  FaAddressCard,
  FaFileAlt,
  FaTasks,
  FaUser,
} from 'react-icons/fa';
import { fetchObjects } from 'src/api/object';
import { listTasks } from 'src/api/task';
import { listOrgMembers } from 'src/api/orgMember';
import { listFact } from 'src/api/fact';
import { Object, Task, OrgMember, Fact } from 'src/types';
import authService from 'src/services/authService';
import NoImage from 'src/assets/NoImage.jpg';
import TaskItem from './TaskItem';
import FactItem from './FactItem';
import LoadingPanel from './LoadingPanel';

const ITEMS_PER_PAGE = 6;

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
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [objectResponse, setObjectResponse] = useState<any>();
  const [factResponse, setFactResponse] = useState<any>();
  const [taskResponse, setTaskResponse] = useState<any>();
  const [creatorResponse, setCreatorResponse] = useState<any>();

  const {
    isOpen: modalIsOpen,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure();

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
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSearchResults([]);
        setFilterCounts({ object: 0, fact: 0, task: 0, creator: 0 });
        return;
      }

      const currentPage = paginationState[activeFilter];

      // Perform searches for all filters simultaneously
      setIsLoading(true);
      try {
        if (filters.includes(SpotLightFilter.OBJECT)) {
          setObjectResponse(
            await fetchObjects(
              activeFilter === SpotLightFilter.OBJECT ? currentPage : 0,
              ITEMS_PER_PAGE,
              query
            )
          );
        }
      } catch (e) {}
      try {
        if (filters.includes(SpotLightFilter.FACT)) {
          setFactResponse(
            await listFact(
              SpotLightFilter.FACT ? currentPage : 0,
              ITEMS_PER_PAGE,
              query
            )
          );
        }
      } catch (e) {}
      try {
        if (filters.includes(SpotLightFilter.TASK)) {
          setTaskResponse(
            await listTasks({
              page: SpotLightFilter.TASK ? currentPage : 0,
              pageSize: ITEMS_PER_PAGE,
              search: query,
              status: '',
              creatorId: authService.getCreatorId() || '',
              assignedId: authService.getCreatorId() || '',
            })
          );
        }
      } catch (e) {}
      try {
        if (filters.includes(SpotLightFilter.CREATOR)) {
          setCreatorResponse(await listOrgMembers(query));
        }
      } catch (e) {}
      setIsLoading(false);

      // Update filter counts
      setFilterCounts({
        object: objectResponse?.totalCount || 0,
        fact: factResponse?.totalCount || 0,
        task: taskResponse?.totalCount || 0,
        creator: creatorResponse?.length || 0,
      });
    }, 300),
    []
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
  }, [searchQuery, debouncedSearch, paginationState]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        closeSpotLight();
        break;
    }
  };

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

  const handlePageChange = (newPage: number) => {
    setPaginationState((prev) => ({ ...prev, [activeFilter]: newPage }));
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
          <InputGroup>
            <InputLeftElement>
              <Icon as={FaSearch} color='gray.300' />
            </InputLeftElement>
            <Input
              ref={inputRef}
              placeholder='Search...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </InputGroup>
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
              {searchResults.length > 0 && (
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
                      paginationState[activeFilter] === totalPages[activeFilter]
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
