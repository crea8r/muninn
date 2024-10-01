import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  Spinner,
  useToast,
  InputGroup,
  InputLeftElement,
  useDisclosure,
  IconButton,
  Tag as ChakraTag,
  TagLabel,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { FaFilter, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { useParams, useHistory } from 'react-router-dom';
import { debounce } from 'lodash';
import {
  // fetchObjectsByTypeAdvanced,
  ObjectWithTags,
  AdvancedFilterParams,
} from 'src/api/objType';
import FilterDialog from './FilterDialog';
import ResizableTable from './ResizableTable';
// import { listTags } from 'src/api/tag';
import BreadcrumbComponent from 'src/components/Breadcrumb';
import { Tag, ObjectTypeFilter } from 'src/types';

const ITEMS_PER_PAGE = 6;
const renderColumns = (columns: string[]) => {
  const firstThree = columns.slice(0, 3);
  const rest = columns.length - 3 > 0 ? columns.length - 3 : 0;
  const response =
    firstThree.join(', ') + (rest > 0 ? ` and ${rest} more` : '');
  return response;
};

export interface ObjecsByTypeProps {
  typeId: string;
  initFilters?: ObjectTypeFilter;
  fetchObjectsByTypeAdvanced: any;
  listTags: any;
}

const ObjectsByType: React.FC<ObjecsByTypeProps> = ({
  typeId,
  initFilters,
  listTags,
  fetchObjectsByTypeAdvanced,
}: ObjecsByTypeProps) => {
  const history = useHistory();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [objects, setObjects] = useState<ObjectWithTags[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [objectType, setObjectType] = useState<any>(null);
  const [predefinedFilters, setPredefinedFilters] = useState<ObjectTypeFilter>(
    initFilters || {
      keyValues: {},
      tags: [],
      objectTypeFields: {},
    }
  );

  const [filterParams, setFilterParams] = useState<AdvancedFilterParams>({
    typeValues: {},
    tags: [],
    search: '',
    sortOrder: 'desc',
  });

  useEffect(() => {
    if (typeId) {
      loadObjects();
    }
  }, [typeId, currentPage, filterParams]);

  const loadObjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetchObjectsByTypeAdvanced({
        typeId,
        params: {
          page: currentPage,
          pageSize: ITEMS_PER_PAGE,
          filter: filterParams,
        },
      });
      setObjects(response.objects);
      setTotalCount(response.totalCount);
      setObjectType(response.objectType);
      const newfilter = structuredClone({
        ...predefinedFilters,
        objectTypeFields: response.objectType.fields,
        displayColumns: predefinedFilters.displayColumns
          ? predefinedFilters.displayColumns
          : Object.keys(response.objectType.fields),
      });
      setPredefinedFilters(newfilter);
    } catch (error) {
      toast({
        title: 'Error loading objects',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    setIsLoading(false);
  };

  const handleClickSort = (e: any) => {
    setFilterParams({
      ...filterParams,
      sortOrder: filterParams.sortOrder === 'asc' ? 'desc' : 'asc',
    });
    setCurrentPage(1);
  };

  const handleApplyFilter = (newObjectTypeFilter: ObjectTypeFilter) => {
    setPredefinedFilters(newObjectTypeFilter);
    setFilterParams({
      ...filterParams,
      typeValues: newObjectTypeFilter.keyValues,
      tags: newObjectTypeFilter.tags.map((tag: Tag) => tag.id),
    });
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleObjectClick = (objectId: string) => {
    history.push(`/objects/${objectId}`);
  };

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setFilterParams({ ...filterParams, search: value });
      setCurrentPage(1);
    }, 300),
    []
  );
  const columnText = renderColumns(predefinedFilters.displayColumns || []);
  return (
    <Box>
      <VStack spacing={4} align='stretch'>
        <HStack>
          <InputGroup>
            <InputLeftElement>
              <SearchIcon color='gray.300' />
            </InputLeftElement>
            <Input
              placeholder='Search object name and description ...'
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </InputGroup>

          <IconButton
            onClick={handleClickSort}
            _hover={{ cursor: 'pointer' }}
            icon={
              filterParams.sortOrder === 'asc' ? (
                <FaSortAmountDown />
              ) : (
                <FaSortAmountUp />
              )
            }
            aria-label={'Date Order'}
          />
        </HStack>
        <HStack background={'gray.100'} borderRadius={8} p={1}>
          <IconButton
            onClick={onOpen}
            _hover={{ cursor: 'pointer' }}
            icon={<FaFilter />}
            aria-label={'Filter'}
          />
          <Box>{columnText}</Box>
          {window.Object.keys(predefinedFilters.keyValues).map((key: any) => (
            <ChakraTag key={key} margin={1}>
              <TagLabel>
                {key} : {predefinedFilters.keyValues[key]}
              </TagLabel>
            </ChakraTag>
          ))}
          {predefinedFilters.tags.map((tag: Tag) => (
            <ChakraTag
              key={tag.id}
              background={tag.color_schema.background}
              color={tag.color_schema.text}
            >
              <TagLabel>tag: {tag.name}</TagLabel>
            </ChakraTag>
          ))}
        </HStack>

        {isLoading ? (
          <Spinner />
        ) : (
          <ResizableTable
            objects={objects}
            filter={predefinedFilters}
            totalCount={totalCount}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
            onObjectClick={handleObjectClick}
          />
        )}
      </VStack>

      <FilterDialog
        isOpen={isOpen}
        onClose={onClose}
        onSearchTag={listTags}
        onApplyFilter={handleApplyFilter}
        initialFilters={predefinedFilters}
      />
    </Box>
  );
};

export default ObjectsByType;
