// components/filter-panel/SearchFilter.tsx
import React, { useEffect, useState } from 'react';
import {
  InputGroup,
  InputLeftElement,
  Input,
  InputRightElement,
  IconButton,
  Spinner,
} from '@chakra-ui/react';
import { ArrowForwardIcon, SearchIcon } from '@chakra-ui/icons';

interface SearchInputProps {
  initialSearchQuery: string;
  setSearchQuery: (query: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  style?: any;
  placeholder?: string;
  isLoading?: boolean;
}

const PROTECT_TIMEOUT = 500;

export const SearchInput: React.FC<SearchInputProps> = ({
  initialSearchQuery,
  setSearchQuery,
  onKeyDown,
  style,
  placeholder,
  isLoading,
}: SearchInputProps) => {
  const [query, setQuery] = useState(initialSearchQuery);
  const [isDirty, setIsDirty] = useState(false);
  const [lastCommit, setLastCommit] = useState(new Date().getTime());
  const onQueryChange = (q: string) => {
    setQuery(q);
    if (q === initialSearchQuery) {
      setIsDirty(false);
    } else {
      setIsDirty(true);
    }
  };
  const commitQuery = () => {
    const nowInMs = new Date().getTime();
    if (isDirty && nowInMs - lastCommit > PROTECT_TIMEOUT && !isLoading) {
      setIsDirty(false);
      setSearchQuery(query);
      setLastCommit(new Date().getTime());
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      commitQuery();
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };
  useEffect(() => {
    setQuery(initialSearchQuery);
  }, [initialSearchQuery]);
  return (
    <InputGroup size='md' style={style ? style : {}}>
      <InputLeftElement pointerEvents='none'>
        {isLoading ? (
          <Spinner color='gray.300' />
        ) : (
          <SearchIcon color='gray.300' />
        )}
      </InputLeftElement>
      <Input
        placeholder={placeholder || 'Enter to search'}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onBlur={commitQuery}
        onKeyDown={handleKeyDown}
        size={'md'}
      />
      {isDirty && !isLoading && (
        <InputRightElement>
          <IconButton
            size='sm'
            onClick={commitQuery}
            icon={<ArrowForwardIcon />}
            aria-label='Search'
            value={'outline'}
            color={'var(--color-primary)'}
          />
        </InputRightElement>
      )}
    </InputGroup>
  );
};
