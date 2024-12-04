// components/filter-panel/SearchFilter.tsx
import React from 'react';
import { useAdvancedFilter } from '../../contexts/AdvancedFilterContext';
import { SearchInput } from 'src/components/SearchInput';
import { VStack, Text } from '@chakra-ui/react';

export const SearchFilter: React.FC = () => {
  const { filterConfig, updateFilter } = useAdvancedFilter();
  return (
    <VStack align='stretch' spacing={2}>
      <Text fontWeight='medium' fontSize='md' color={'var(--color-primary)'}>
        Search
      </Text>
      <SearchInput
        initialSearchQuery={filterConfig.search}
        setSearchQuery={(query) => updateFilter({ search: query })}
        placeholder='and/or to search for keywords'
      />
    </VStack>
  );
};
