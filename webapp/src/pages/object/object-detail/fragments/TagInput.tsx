import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Flex,
  Input,
  Tag as ChakraTag,
  TagCloseButton,
  TagLabel,
  Text,
  useToast,
} from '@chakra-ui/react';
import { Tag } from 'src/types';
import { createTag, listTags } from 'src/api/tag';

interface TagInputProps {
  tags: Tag[];
  isReadOnly?: boolean;
  onAddTag: (tagId: string) => void;
  onRemoveTag: (tagId: string) => void;
}

const TagInput: React.FC<TagInputProps> = ({
  tags,
  isReadOnly = false,
  onAddTag,
  onRemoveTag,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const fetchSuggestions = async (query: string): Promise<Tag[]> => {
    const response = await listTags({ page: 0, pageSize: 10, query });
    return response.tags;
  };

  useEffect(() => {
    const getSuggestions = async () => {
      if (inputValue) {
        const fetchedSuggestions = await fetchSuggestions(inputValue);
        setSuggestions(fetchedSuggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    getSuggestions();
  }, [inputValue, tags]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      addTag(inputValue);
    } else if (
      e.key === 'Backspace' &&
      !inputValue &&
      tags &&
      tags.length > 0
    ) {
      removeTag(tags[tags.length - 1].id);
    }
  };

  const addTag = async (text: string) => {
    const newTag = suggestions?.find(
      (s) => s.name.toLowerCase() === text.toLowerCase()
    );
    if (newTag && !tags.some((tag) => tag.id === newTag.id)) {
      try {
        await onAddTag(newTag.id);
        setInputValue('');
        setShowSuggestions(false);
        toast({
          title: 'Tag added.',
          description: `Tag "${newTag.name}" has been added.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Error adding tag.',
          description: 'There was an error adding the tag.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      // create new tag
      try {
        const newTag = await createTag({
          name: text,
          description: '',
          color_schema: { background: '#e2e8f0', text: '#2d3748' },
        });
        setInputValue('');
        toast({
          title: 'Success',
          description: `Tag "${text}" has been created.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        await onAddTag(newTag.id);
        toast({
          title: 'Success',
          description: `Tag "${newTag.name}" has been added.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (e) {
        toast({
          title: 'Error',
          description: 'There was an error creating or adding the tag.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setShowSuggestions(false);
      }
    }
  };

  const removeTag = async (id: string) => {
    try {
      await onRemoveTag(id);
      setInputValue('');
      setShowSuggestions(false);
      toast({
        title: 'Success',
        description: `Tag is successfully removed.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was an error removing the tag.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSuggestionClick = (suggestion: Tag) => {
    addTag(suggestion.name);
    inputRef.current?.focus();
  };

  return (
    <Box position='relative'>
      <Flex
        flexWrap='wrap'
        alignItems='center'
        minHeight='40px'
        border='1px solid'
        borderColor='gray.200'
        borderRadius='md'
        p={2}
      >
        {tags.map((tag) => (
          <ChakraTag
            backgroundColor={tag.color_schema.background}
            color={tag.color_schema.text}
            key={tag.id}
            margin={1}
          >
            <TagLabel>{tag.name}</TagLabel>
            <TagCloseButton onClick={() => removeTag(tag.id)} />
          </ChakraTag>
        ))}
        {!isReadOnly && (
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            placeholder='Add a tag...'
            size='sm'
            border='none'
            _focus={{ outline: 'none' }}
            flexGrow={1}
            minWidth='120px'
            marginTop={1}
          />
        )}
      </Flex>
      {showSuggestions && suggestions?.length > 0 && (
        <Box
          position='absolute'
          top='100%'
          left={0}
          right={0}
          zIndex={1}
          mt={1}
          bg='white'
          boxShadow='md'
          borderRadius='md'
          maxHeight='200px'
          overflowY='auto'
        >
          {suggestions.map((suggestion) => (
            <Text
              key={suggestion.id}
              p={2}
              cursor='pointer'
              _hover={{ bg: 'gray.100' }}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.name}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default TagInput;
