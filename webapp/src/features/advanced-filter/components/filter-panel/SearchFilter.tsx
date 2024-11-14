// components/filter-panel/SearchFilter.tsx
import React, { useState } from 'react';
import {
  InputGroup,
  InputLeftElement,
  Input,
  VStack,
  Text,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useAdvancedFilter } from '../../contexts/AdvancedFilterContext';

export const SearchFilter: React.FC = () => {
  const { filterConfig, updateFilter } = useAdvancedFilter();
  const [query, setQuery] = useState(filterConfig.search || '');
  const [isDirty, setIsDirty] = useState(false);
  const onQueryChange = (q: string) => {
    setQuery(q);
    if (q === filterConfig.search) {
      setIsDirty(false);
    } else {
      setIsDirty(true);
    }
  };
  const commitQuery = () => {
    setIsDirty(false);
    updateFilter({ search: query });
  };
  return (
    <VStack align='stretch' spacing={2}>
      <Text fontWeight='bold' fontSize='md' color={'var(--color-primary)'}>
        Search
      </Text>
      <InputGroup size='md'>
        <InputLeftElement pointerEvents='none'>
          <SearchIcon color='gray.300' />
        </InputLeftElement>
        <Input
          placeholder='Search objects...'
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onBlur={commitQuery}
          size={'md'}
        />
        {isDirty && (
          <InputRightElement>
            <IconButton
              size='sm'
              onClick={commitQuery}
              icon={<SearchIcon />}
              aria-label='Search'
              value={'ghost'}
            />
          </InputRightElement>
        )}
      </InputGroup>
    </VStack>
  );
};
