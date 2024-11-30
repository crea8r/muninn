// components/filter-panel/FilterPanel.tsx
import React from 'react';
import { Box, VStack, Text, Divider } from '@chakra-ui/react';
import { SearchFilter } from './SearchFilter';
import { TagFilter } from './tag-filter/TagFilter';
import { TypeFilter } from './type-filter/TypeFilter';
import { SortingControl } from './SortingControl';
import { FilterOptions } from 'src/types/FilterConfig';
import { TypeValueFilter } from './type-value-filter/TypeValueCriteria';
import { ActiveFilters as DataExplorer } from './ActiveFilters';
import { FunnelStepFilter } from './funnel-step-filter/FunnelStepFilter';

interface FilterPanelProps {
  options?: FilterOptions;
  showCreateTemplate?: () => void;
  showCreateTemplateAction?: () => void;
}

const FilterHeader = () => {
  return (
    <Box>
      <Text fontWeight='medium' fontSize='md' color={'var(--color-primary)'}>
        Filters
      </Text>
    </Box>
  );
};

export const FilterPanel: React.FC<FilterPanelProps> = ({
  options,
  showCreateTemplate,
  showCreateTemplateAction,
}) => {
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
        <DataExplorer
          showCreateTemplate={showCreateTemplate}
          showCreateTemplateAction={showCreateTemplateAction}
        />
        <Divider />
        <SearchFilter />
        <FilterHeader />
        <FunnelStepFilter />
        <TagFilter />
        <TypeFilter />
        <TypeValueFilter />
        <SortingControl />
      </VStack>
    </Box>
  );
};
