// components/filter-panel/type-filter/TypeFilter.tsx
import React from 'react';
import {
  VStack,
  Text,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  Tooltip,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useAdvancedFilter } from '../../../contexts/AdvancedFilterContext';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import { useState, useMemo, useRef } from 'react';
import { ObjectType } from 'src/types';

export const TypeFilter: React.FC = () => {
  const { filterConfig, updateFilter } = useAdvancedFilter();
  const { globalData } = useGlobalContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const types = useMemo(
    () => globalData?.objectTypeData?.objectTypes || [],
    [globalData?.objectTypeData?.objectTypes]
  );
  const selectedTypeIds = useMemo(
    () => filterConfig.typeIds || [],
    [filterConfig.typeIds]
  );

  // Get selected types
  const selectedTypes = useMemo(
    () => types.filter((type) => selectedTypeIds.includes(type.id)),
    [types, selectedTypeIds]
  );

  // Filter unselected types based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return types
      .filter(
        (type) =>
          !selectedTypeIds.includes(type.id) &&
          (type.name.toLowerCase().includes(query) ||
            type.description?.toLowerCase().includes(query) ||
            Object.keys(type.fields).some((field) =>
              field.toLowerCase().includes(query)
            ))
      )
      .slice(0, 10);
  }, [types, searchQuery, selectedTypeIds]);

  // Handle clicking outside search results
  const handleClickOutside = (event: MouseEvent) => {
    if (
      searchRef.current &&
      !searchRef.current.contains(event.target as Node)
    ) {
      setIsSearching(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTypeRemove = (typeId: string) => {
    updateFilter({
      typeIds: selectedTypeIds.filter((id) => id !== typeId),
    });
  };

  const handleTypeAdd = (typeId: string) => {
    updateFilter({
      typeIds: [...selectedTypeIds, typeId],
    });
    setSearchQuery('');
    setIsSearching(false);
  };

  // Render field list for tooltip
  const renderFieldsList = (type: ObjectType) => {
    const fields = Object.keys(type.fields);
    if (fields.length === 0) return 'No fields defined';
    return fields.join(', ');
  };

  return (
    <VStack align='stretch' spacing={3}>
      <Text fontWeight='medium' fontSize='sm'>
        Object Types
      </Text>

      {/* Selected Types */}
      <Wrap spacing={2}>
        {selectedTypes.map((type) => (
          <WrapItem key={type.id}>
            <Tooltip label={renderFieldsList(type)} placement='top' hasArrow>
              <Tag size='md' variant='solid' colorScheme='blue'>
                <TagLabel>{type.name}</TagLabel>
                <TagCloseButton onClick={() => handleTypeRemove(type.id)} />
              </Tag>
            </Tooltip>
          </WrapItem>
        ))}
      </Wrap>

      {/* Search Input */}
      <Box position='relative' ref={searchRef}>
        <InputGroup size='sm'>
          <InputLeftElement pointerEvents='none'>
            <SearchIcon color='gray.400' />
          </InputLeftElement>
          <Input
            placeholder='Find object types...'
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearching(true);
            }}
            onFocus={() => setIsSearching(true)}
          />
        </InputGroup>

        {/* Search Results Dropdown */}
        {isSearching && searchResults.length > 0 && (
          <Box
            position='absolute'
            top='100%'
            left={0}
            right={0}
            zIndex={1000}
            mt={1}
            bg='white'
            borderRadius='md'
            boxShadow='lg'
            maxH='200px'
            overflowY='auto'
            borderWidth={1}
          >
            <VStack align='stretch' spacing={0}>
              {searchResults.map((type) => (
                <Box
                  key={type.id}
                  px={3}
                  py={2}
                  cursor='pointer'
                  _hover={{ bg: 'gray.50' }}
                  onClick={() => handleTypeAdd(type.id)}
                >
                  <HStack>
                    <Tag size='md' variant='subtle' colorScheme='blue'>
                      <TagLabel>{type.name}</TagLabel>
                    </Tag>
                    <Text fontSize='xs' color='gray.500'>
                      {Object.keys(type.fields).length} fields
                    </Text>
                  </HStack>
                  {type.description && (
                    <Text fontSize='xs' color='gray.600' mt={1}>
                      {type.description}
                    </Text>
                  )}
                  <Text fontSize='xs' color='gray.500' mt={1}>
                    Fields: {renderFieldsList(type)}
                  </Text>
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* No Results Message */}
        {isSearching && searchQuery && searchResults.length === 0 && (
          <Box
            position='absolute'
            top='100%'
            left={0}
            right={0}
            zIndex={1000}
            mt={1}
            bg='white'
            borderRadius='md'
            boxShadow='lg'
            p={3}
            textAlign='center'
          >
            <Text fontSize='sm' color='gray.500'>
              No matching object types found
            </Text>
          </Box>
        )}
      </Box>
    </VStack>
  );
};
