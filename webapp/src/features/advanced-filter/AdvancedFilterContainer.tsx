// features/advanced-filter/AdvancedFilterContainer.tsx
import React from 'react';
import { Box, Flex, IconButton, VStack, useToast } from '@chakra-ui/react';
import { FilterPanel } from './components/filter-panel/FilterPanel';
import { ViewController } from './components/view-controller/ViewController';
import { useAdvancedFilter } from './contexts/AdvancedFilterContext';
import { useAdvancedFilterData } from './hooks/useAdvancedFilterData';
import { ViewConfigBase, ViewConfigSource } from './types/view-config';
import { FilterOptions } from 'src/types/FilterConfig';
import { StepCountsDisplay } from './components/StepCountsDisplay';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { UpsertTemplateDialog } from './components/templates/UpsertTemplateDialog';
import { useViewConfig } from './hooks/useViewConfig';
import { AutomationForm } from '../automation/components/AutomationForm';

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
  const [isOpenSaveTemplate, setIsOpenSaveTemplate] = React.useState(false);
  const [isOpenCreateAutomation, seIsOpenCreateAutomation] =
    React.useState(false);

  const { config: viewConfig } = useViewConfig({
    source: viewSource,
    initialConfig: initialViewConfig,
    onConfigChange: onViewConfigChange,
  });

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
        width={showFilterPanel ? '300px' : '16px'}
        height='100%'
        borderRight='2px'
        borderColor='gray.200'
        overflowY='scroll'
        position={'relative'}
        background={showFilterPanel ? 'transparent' : 'gray.200'}
        cursor={showFilterPanel ? 'auto' : 'pointer'}
        onClick={showFilterPanel ? null : () => setShowFilterPanel(true)}
        title={showFilterPanel ? '' : 'Show filters'}
      >
        {/* Toggle Button */}
        <IconButton
          aria-label={showFilterPanel ? 'Hide filters' : 'Show filters'}
          icon={showFilterPanel ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          position='absolute'
          right={showFilterPanel ? '0' : '-6px'}
          top='0'
          size='xs'
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          borderRadius='0 xs xs 0'
          variant={'ghost'}
        />
        {showFilterPanel && (
          <FilterPanel
            options={filterOptions}
            showCreateTemplate={() => setIsOpenSaveTemplate(true)}
            showCreateAutomation={() => seIsOpenCreateAutomation(true)}
          />
        )}
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
      <UpsertTemplateDialog
        isOpen={isOpenSaveTemplate}
        template={{
          config: {
            version: 'v1',
            filter: filterConfig,
            view: viewConfig,
          },
        }}
        onClose={() => {
          setIsOpenSaveTemplate(false);
        }}
      />
      <AutomationForm
        isOpen={isOpenCreateAutomation}
        initialData={{
          filterConfig: extractPropertiesFromObject(filterConfig, [
            'search',
            'tagIds',
            'typeIds',
            'typeValueCriteria',
            'funnelStepFilter',
          ]),
        }}
        onSuccess={() => {}}
        onClose={() => {
          seIsOpenCreateAutomation(false);
        }}
      />
    </Flex>
  );
};
const extractPropertiesFromObject = (obj: any, keys: string[]) => {
  const newObj: any = {};
  keys.forEach((key) => {
    if (obj[key] !== undefined) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};
