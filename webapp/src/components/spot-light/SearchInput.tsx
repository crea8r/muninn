import React from 'react';
import { Input, InputGroup, InputLeftElement, Icon } from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';

interface SearchInputProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  closeSpotLight: () => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  searchQuery,
  setSearchQuery,
  closeSpotLight,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeSpotLight();
    }
  };

  return (
    <InputGroup>
      <InputLeftElement>
        <Icon as={FaSearch} color='gray.300' />
      </InputLeftElement>
      <Input
        placeholder='Search...'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
      />
    </InputGroup>
  );
};

export default SearchInput;
