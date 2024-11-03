// components/filter-panel/SearchFilter.tsx
import React from 'react';
import {
  InputGroup,
  InputLeftElement,
  Input,
  VStack,
  Text,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useAdvancedFilter } from '../../contexts/AdvancedFilterContext';

export const SearchFilter: React.FC = () => {
  const { filterConfig, updateFilter } = useAdvancedFilter();

  return (
    <VStack align='stretch' spacing={2}>
      <Text fontWeight='bold' fontSize='md' color={'blue.500'}>
        Search
      </Text>
      <InputGroup size='md'>
        <InputLeftElement pointerEvents='none'>
          <SearchIcon color='gray.300' />
        </InputLeftElement>
        <Input
          placeholder='Search objects...'
          value={filterConfig.search || ''}
          onChange={(e) => updateFilter({ search: e.target.value })}
          size={'sm'}
        />
      </InputGroup>
    </VStack>
  );
};
