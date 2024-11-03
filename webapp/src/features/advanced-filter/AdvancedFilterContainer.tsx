// features/advanced-filter/AdvancedFilterContainer.tsx
import React from 'react';
import { Box, Flex, VStack, useToast } from '@chakra-ui/react';
import { FilterPanel } from './components/filter-panel/FilterPanel';
import { ViewController } from './components/view-controller/ViewController';
import { useAdvancedFilter } from './contexts/AdvancedFilterContext';
import { useAdvancedFilterData } from './hooks/useAdvancedFilterData';
import { ViewConfigBase, ViewConfigSource } from './types/view-config';
import { FilterOptions } from './types/filters';
import { StepCountsDisplay } from './components/StepCountsDisplay';

export interface AdvancedFilterContainerProps {
  viewSource: ViewConfigSource;
  initialViewConfig?: ViewConfigBase;
  onViewConfigChange?: (config: ViewConfigBase) => void;
  filterOptions?: FilterOptions;
}

export const AdvancedFilterContainer: React.FC<
  AdvancedFilterContainerProps
> = ({ viewSource, initialViewConfig, onViewConfigChange, filterOptions }) => {
  // Get filter state and data
  const { filterConfig } = useAdvancedFilter();
  const { data, totalCount, stepCounts, isLoading, error } =
    useAdvancedFilterData(filterConfig);

  // Process total count which might include step counts

  const toast = useToast();
  if (error) {
    toast({
      title: 'Error fetching data',
      description: error.message,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  }

  return (
    <Flex height='100%' overflow='hidden'>
      {/* Filter Panel */}
      <Box
        width='300px'
        height='100%'
        borderRight='1px'
        borderColor='gray.200'
        overflowY='auto'
      >
        <FilterPanel options={filterOptions} />
      </Box>

      {/* Main Content Area */}
      <Box flex='1' height='100%' overflow='hidden'>
        <VStack height='100%' spacing={0}>
          {/* Stats Bar - shows step counts if available */}
          {stepCounts && filterConfig.funnelStepFilter && (
            <Box
              w='100%'
              p={4}
              borderBottomWidth={1}
              borderColor='gray.200'
              bg='gray.50'
            >
              <StepCountsDisplay
                totalCount={totalCount}
                stepCounts={stepCounts}
                funnelStepFilter={filterConfig.funnelStepFilter}
              />
            </Box>
          )}

          {/* View Controller */}
          <Box flex='1' width='100%' overflow='hidden'>
            <ViewController
              source={viewSource}
              initialConfig={initialViewConfig}
              onConfigChange={onViewConfigChange}
              data={data}
              isLoading={isLoading}
              totalCount={totalCount}
            />
          </Box>
        </VStack>
      </Box>
    </Flex>
  );
};
