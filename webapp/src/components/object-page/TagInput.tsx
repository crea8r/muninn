import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Flex,
  Input,
  Tag as ChakraTag,
  TagCloseButton,
  TagLabel,
  Text,
} from '@chakra-ui/react';
import { Tag } from 'src/types';
import { listTags } from 'src/api/tag';

interface TagInputProps {
  tags: Tag[];
  onChange: (tags: Tag[]) => void;
  isReadOnly?: boolean;
}

const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  isReadOnly = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    } else if (e.key === 'Backspace' && !inputValue) {
      removeTag(tags[tags.length - 1].id);
    }
  };

  const addTag = (text: string) => {
    const suggestion = suggestions.find(
      (s) => s.name.toLowerCase() === text.toLowerCase()
    );
    const newTag = suggestion || {
      id: Date.now().toString(),
      name: text,
      description: '',
      color_schema: {
        text: '#fff',
        background: '#000',
      },
    };
    onChange([...tags, newTag]);
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (id: string) => {
    onChange(tags.filter((tag) => tag.id !== id));
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
          >
            {tag.name}
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
          />
        )}
      </Flex>
      {showSuggestions && suggestions.length > 0 && (
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
