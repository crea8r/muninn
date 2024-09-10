import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Flex,
  Input,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
} from '@chakra-ui/react';

interface TagInputProps {
  tags: { id: string; text: string }[];
  onChange: (tags: { id: string; text: string }[]) => void;
  isReadOnly?: boolean;
}

interface Suggestion {
  id: string;
  text: string;
}

const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  isReadOnly = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock function to fetch tag suggestions
  // In a real application, this would be an API call
  const fetchSuggestions = async (query: string): Promise<Suggestion[]> => {
    // Simulating API delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    const mockSuggestions = [
      { id: '1', text: 'React' },
      { id: '2', text: 'TypeScript' },
      { id: '3', text: 'JavaScript' },
      { id: '4', text: 'Node.js' },
      { id: '5', text: 'GraphQL' },
    ];
    return mockSuggestions.filter(
      (tag) =>
        tag.text.toLowerCase().includes(query.toLowerCase()) &&
        !tags.some((existingTag) => existingTag.id === tag.id)
    );
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
      (s) => s.text.toLowerCase() === text.toLowerCase()
    );
    const newTag = suggestion || { id: Date.now().toString(), text };
    onChange([...tags, newTag]);
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (id: string) => {
    onChange(tags.filter((tag) => tag.id !== id));
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    addTag(suggestion.text);
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
          <Tag
            key={tag.id}
            size='md'
            borderRadius='full'
            variant='solid'
            colorScheme='blue'
            m={1}
          >
            <TagLabel>{tag.text}</TagLabel>
            {!isReadOnly && (
              <TagCloseButton onClick={() => removeTag(tag.id)} />
            )}
          </Tag>
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
              {suggestion.text}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default TagInput;
