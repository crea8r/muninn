import React, { useState, useEffect, useRef } from 'react';
import { Box, Input, Text, useToast } from '@chakra-ui/react';
import { Tag } from 'src/types';
import LoadingPanel from './LoadingPanel';

interface TagSuggestionProps {
  onAttachTag: (tag: Tag) => void;
  onCreateAndAttachTag?: (text: string) => void;
  fetchSuggestions: (query: string) => Promise<Tag[]>;
}

const TagSuggestion = ({
  onAttachTag,
  onCreateAndAttachTag,
  fetchSuggestions,
}: TagSuggestionProps) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  const handleInputKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      const newTag = suggestions?.find(
        (s) => s.name.toLowerCase() === inputValue.toLowerCase()
      );
      try {
        setIsLoading(true);
        if (newTag) {
          await onAttachTag(newTag);
        } else {
          if (onCreateAndAttachTag) {
            await onCreateAndAttachTag(inputValue);
          }
        }
        setInputValue('');
        setShowSuggestions(false);
        toast({
          title: 'Tag added.',
          description: `Tag "${inputValue}" has been added.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Error adding tag.',
          description:
            typeof error === 'string'
              ? error
              : 'There was an error adding the tag.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
        setShowSuggestions(false);
      }
    }
  };
  const handleSuggestionClick = (suggestion: Tag) => {
    onAttachTag(suggestion);
    inputRef.current?.focus();
    setInputValue('');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  return (
    <Box position={'relative'}>
      {isLoading ? (
        <LoadingPanel height='auto' minHeight='auto' />
      ) : (
        <>
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
                  onClick={() => {
                    handleSuggestionClick(suggestion);
                  }}
                >
                  {suggestion.name}
                </Text>
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default TagSuggestion;
