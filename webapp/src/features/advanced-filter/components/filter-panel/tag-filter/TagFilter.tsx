// components/filter-panel/tag-filter/TagFilter.tsx
import React from 'react';
import {
  VStack,
  Text,
  Wrap,
  WrapItem,
  Tag as ChakraTag,
  TagLabel,
  TagCloseButton,
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  useOutsideClick,
  HStack,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useAdvancedFilter } from '../../../contexts/AdvancedFilterContext';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import { useState, useMemo, useRef } from 'react';
import { Tag } from 'src/types';
import { useUnsavedChangesContext } from 'src/contexts/unsaved-changes/UnsavedChange';

export const TagFilter: React.FC = () => {
  const { filterConfig, updateFilter } = useAdvancedFilter();
  const { globalData } = useGlobalContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { setDirty } = useUnsavedChangesContext();

  const tags = useMemo(
    () => globalData?.tagData?.tags || [],
    [globalData?.tagData?.tags]
  );
  const selectedTagIds = useMemo(
    () => filterConfig.tagIds || [],
    [filterConfig.tagIds]
  );

  // Get selected tags
  const selectedTags = useMemo(
    () => tags.filter((tag: Tag) => selectedTagIds.includes(tag.id)),
    [tags, selectedTagIds]
  );

  // Filter unselected tags based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return tags
      .filter(
        (tag: Tag) =>
          !selectedTagIds.includes(tag.id) && // Exclude already selected tags
          (tag.name.toLowerCase().includes(query) ||
            tag.description.toLowerCase().includes(query))
      )
      .slice(0, 10); // Limit results to 10 for better performance
  }, [tags, searchQuery, selectedTagIds]);

  // Handle clicking outside search results
  useOutsideClick({
    ref: searchRef,
    handler: () => setIsSearching(false),
  });

  const handleTagRemove = (tagId: string) => {
    updateFilter({
      tagIds: selectedTagIds.filter((id: any) => id !== tagId),
    });
  };

  const handleTagAdd = (tagId: string) => {
    updateFilter({
      tagIds: [...selectedTagIds, tagId],
    });
    setSearchQuery('');
    setIsSearching(false);
    setDirty(true);
  };

  const clearAll = () => {
    updateFilter({
      tagIds: [],
    });
  };

  return (
    <VStack align='stretch' spacing={3}>
      <HStack justify='space-between' width={'100%'} alignItems={'center'}>
        <Text fontWeight='medium' fontSize='sm'>
          Tags
        </Text>
        <Text
          fontSize='sm'
          fontWeight={'light'}
          color='gray.500'
          textDecoration={'underline'}
          cursor='pointer'
          onClick={clearAll}
        >
          Clear
        </Text>
      </HStack>
      {/* Selected Tags */}
      <Wrap spacing={2}>
        {selectedTags.map((tag) => (
          <WrapItem key={tag.id}>
            <ChakraTag
              size='md'
              variant='solid'
              backgroundColor={tag.color_schema.background}
              color={tag.color_schema.text}
            >
              <TagLabel>{tag.name}</TagLabel>
              <TagCloseButton onClick={() => handleTagRemove(tag.id)} />
            </ChakraTag>
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
            placeholder='Find tags...'
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
              {searchResults.map((tag) => (
                <Box
                  key={tag.id}
                  px={3}
                  py={2}
                  cursor='pointer'
                  _hover={{ bg: 'gray.50' }}
                  onClick={() => handleTagAdd(tag.id)}
                >
                  <ChakraTag
                    size='md'
                    variant='subtle'
                    backgroundColor={`${tag.color_schema.background}`}
                    color={tag.color_schema.text}
                  >
                    <TagLabel>{tag.name}</TagLabel>
                  </ChakraTag>
                  {tag.description && (
                    <Text fontSize='xs' color='gray.600' mt={1}>
                      {tag.description}
                    </Text>
                  )}
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
              No matching tags found
            </Text>
          </Box>
        )}
      </Box>
    </VStack>
  );
};
