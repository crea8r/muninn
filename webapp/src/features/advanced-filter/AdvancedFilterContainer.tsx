// features/advanced-filter/AdvancedFilterContainer.tsx
import React from 'react';
import { Box, Flex, IconButton, VStack, useToast } from '@chakra-ui/react';
import { FilterPanel } from './components/filter-panel/FilterPanel';
import { ViewController } from './components/view-controller/ViewController';
import { useAdvancedFilter } from './contexts/AdvancedFilterContext';
import { useAdvancedFilterData } from './hooks/useAdvancedFilterData';
import { ViewConfigBase, ViewConfigSource } from './types/view-config';
import { FilterOptions } from './types/filters';
import { StepCountsDisplay } from './components/StepCountsDisplay';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

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
  const {
    data,
    totalCount,
    stepCounts,
    isLoading,
    error,
    refetch,
    selectedItems,
    setSelectedItems,
  } = useAdvancedFilterData(filterConfig);

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

  const [showFilterPanel, setShowFilterPanel] = React.useState(true);

  return (
    <Flex height='100%' overflow='hidden'>
      {/* Filter Panel */}
      <Box
        width={showFilterPanel ? '300px' : '8px'}
        height='100%'
        borderRight='2px'
        borderColor='gray.200'
        overflowY='visible'
        position={'relative'}
        background={showFilterPanel ? 'transparent' : 'gray.200'}
        cursor={showFilterPanel ? 'auto' : 'pointer'}
        onClick={showFilterPanel ? null : () => setShowFilterPanel(true)}
      >
        {/* Toggle Button */}
        <IconButton
          aria-label={showFilterPanel ? 'Hide filters' : 'Show filters'}
          icon={showFilterPanel ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          position='absolute'
          right='0'
          top='0'
          size='xs'
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          borderRadius='0 xs xs 0'
          variant={'ghost'}
        />
        {showFilterPanel && <FilterPanel options={filterOptions} />}
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
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
              isLoading={isLoading}
              totalCount={totalCount}
              refetch={refetch}
            />
          </Box>
        </VStack>
      </Box>
    </Flex>
  );
};
