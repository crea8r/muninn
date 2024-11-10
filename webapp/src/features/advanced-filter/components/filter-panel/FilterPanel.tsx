// components/filter-panel/FilterPanel.tsx
import React from 'react';
import { Box, VStack } from '@chakra-ui/react';
import { SearchFilter } from './SearchFilter';
import { TagFilter } from './tag-filter/TagFilter';
import { TypeFilter } from './type-filter/TypeFilter';
import { SortingControl } from './SortingControl';
import { FilterOptions } from '../../types/filters';
import { TypeValueFilter } from './type-value-filter/TypeValueCriteria';
import { ActiveFilters } from './ActiveFilters';
import { FunnelStepFilter } from './funnel-step-filter/FunnelStepFilter';

interface FilterPanelProps {
  options?: FilterOptions;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ options }) => {
  return (
    <Box
      width='300px'
      p={4}
      borderRight='1px'
      borderColor='gray.200'
      overflowY={'scroll'}
      overflowX={'hidden'}
    >
      <VStack spacing={4} align='stretch' overflowX={'hidden'}>
        <SearchFilter />
        <ActiveFilters />
        <FunnelStepFilter />
        <TagFilter />
        <TypeFilter />
        <TypeValueFilter />
        <SortingControl />
      </VStack>
    </Box>
  );
};
