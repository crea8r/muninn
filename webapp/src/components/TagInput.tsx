import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Input,
  Tag as ChakraTag,
  TagLabel,
  TagCloseButton,
  VStack,
  Text,
  Flex,
  Wrap,
  WrapItem,
  useOutsideClick,
  Spinner,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { Tag } from 'src/types';
import { debounce } from 'lodash';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  availableTags: Tag[];
  isLoading?: boolean;
  isReadOnly?: boolean;
  placeholder?: string;
  maxHeight?: string;
  limit?: number;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  availableTags,
  isLoading = false,
  isReadOnly = false,
  placeholder = 'Search and select tags...',
  maxHeight = '200px',
  limit = 20,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useOutsideClick({
    ref: ref,
    handler: () => setIsOpen(false),
  });

  // Filter tags based on input value
  const filterTags = debounce((searchValue: string) => {
    if (!searchValue.trim()) {
      setFilteredTags([]);
      return;
    }

    const filtered = (availableTags || []).filter(
      (tag) =>
        tag.name.toLowerCase().includes(searchValue.toLowerCase()) &&
        !tags.some((selectedTag) => selectedTag === tag.id)
    );
    setFilteredTags(filtered);
  }, 300);

  useEffect(() => {
    filterTags(inputValue);
  }, [inputValue, availableTags, tags, filterTags]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    setIsOpen(true);
  };

  const handleTagSelect = (tag: Tag) => {
    if (tags.length >= limit) {
      tags[tags.length - 1] = tag.id;
      onChange(tags);
    } else {
      onChange([...tags, tag.id]);
    }
    setInputValue('');
    setIsOpen(false);
  };

  const handleRemoveTag = (tagId: string) => {
    onChange(tags.filter((tag) => tag !== tagId));
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  return (
    <Box position='relative' ref={ref}>
      <VStack spacing={2} align='stretch'>
        {/* Selected Tags */}
        <Wrap spacing={2} mb={tags.length > 0 ? 2 : 0}>
          {availableTags
            .filter((tag) => tags.indexOf(tag.id) > -1)
            .map((tag) => (
              <WrapItem key={tag.id}>
                <ChakraTag
                  size='md'
                  borderRadius='full'
                  variant='solid'
                  color={tag.color_schema.text}
                  bg={tag.color_schema.background}
                >
                  <TagLabel>{tag.name}</TagLabel>
                  {!isReadOnly && (
                    <TagCloseButton onClick={() => handleRemoveTag(tag.id)} />
                  )}
                </ChakraTag>
              </WrapItem>
            ))}
        </Wrap>

        {/* Search Input */}
        {!isReadOnly && (
          <InputGroup size='md'>
            <InputLeftElement>
              <SearchIcon color='gray.500' />
            </InputLeftElement>
            <Input
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder={placeholder}
              pr='4.5rem'
            />
            {isLoading && (
              <Flex
                position='absolute'
                right='4'
                top='50%'
                transform='translateY(-50%)'
              >
                <Spinner size='sm' />
              </Flex>
            )}
          </InputGroup>
        )}

        {/* Dropdown for filtered tags */}
        {isOpen && filteredTags.length > 0 && (
          <Box
            position='absolute'
            top='100%'
            left={0}
            right={0}
            zIndex={1000}
            bg='white'
            boxShadow='md'
            borderRadius='md'
            mt={1}
            maxH={maxHeight}
            overflowY='auto'
          >
            <VStack align='stretch' spacing={0}>
              {filteredTags.map((tag) => (
                <Box
                  key={tag.id}
                  px={4}
                  py={2}
                  cursor='pointer'
                  _hover={{ bg: 'gray.100' }}
                  onClick={() => handleTagSelect(tag)}
                >
                  <Flex alignItems='center'>
                    <ChakraTag
                      size='sm'
                      borderRadius='full'
                      variant='solid'
                      colorScheme='blue'
                      bg={tag.color_schema.background}
                      color={tag.color_schema.text}
                    >
                      <TagLabel>{tag.name}</TagLabel>
                    </ChakraTag>
                    {tag.description && (
                      <Text ml={2} fontSize='sm' color='gray.600'>
                        {tag.description}
                      </Text>
                    )}
                  </Flex>
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* No results message */}
        {isOpen && inputValue && filteredTags.length === 0 && !isLoading && (
          <Box
            position='absolute'
            top='100%'
            left={0}
            right={0}
            zIndex={1000}
            bg='white'
            boxShadow='md'
            borderRadius='md'
            mt={1}
            p={4}
          >
            <Text color='gray.500'>No matching tags found</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default TagInput;
