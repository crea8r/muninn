// components/filter-panel/funnel-step-filter/FunnelStepFilter.tsx
import React from 'react';
import {
  VStack,
  Text,
  Select,
  Checkbox,
  CheckboxGroup,
} from '@chakra-ui/react';
import { useAdvancedFilter } from '../../../contexts/AdvancedFilterContext';
import { SubStatus } from 'src/features/advanced-filter/constants';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import { getSubStatusLabel } from 'src/utils/substatus';

const allStatuses = [
  SubStatus.TO_ENGAGE,
  SubStatus.PROCEEDING,
  SubStatus.DROP_OUT,
];

export const FunnelStepFilter: React.FC = () => {
  const { filterConfig, updateFilter } = useAdvancedFilter();
  const { globalData } = useGlobalContext();
  const funnels = globalData?.funnelData?.funnels || [];

  const currentFilter = filterConfig.funnelStepFilter;
  const selectedFunnel = funnels.find((f) => f.id === currentFilter?.funnelId);

  // Convert numbers to strings for CheckboxGroup value
  const selectedSubStatuses = currentFilter?.subStatuses?.map(String) || [
    ...allStatuses,
  ];
  const handleStepToggle = (stepIds: string[]) => {
    if (!currentFilter) return;

    if (stepIds.length === 0) {
      // If no steps selected, remove the entire funnel filter
      updateFilter({
        funnelStepFilter: undefined,
      });
      return;
    }

    updateFilter({
      funnelStepFilter: {
        ...currentFilter,
        stepIds,
      },
    });
  };

  const handleFunnelChange = (funnelId: string) => {
    const funnel = funnels.find((f) => f.id === funnelId);
    if (!funnel) {
      // If funnel not found, remove the filter
      updateFilter({
        funnelStepFilter: undefined,
      });
      return;
    }

    // Set all steps active by default
    updateFilter({
      funnelStepFilter: {
        funnelId,
        stepIds: funnel.steps.map((s) => s.id),
        subStatuses: currentFilter?.subStatuses || [...allStatuses],
      },
    });
  };

  const handleSubStatusChange = (selected: string[]) => {
    if (!currentFilter) return;

    // Convert back to numbers, ensuring 0 is properly handled
    const numericValues = selected.map((val) => parseInt(val, 10));
    updateFilter({
      funnelStepFilter: {
        ...currentFilter,
        subStatuses: numericValues,
      },
    });
  };

  return (
    <VStack align='stretch' spacing={4} width={'100%'}>
      <Text fontWeight='medium' fontSize='sm'>
        Funnel & Steps Filter
      </Text>

      <Select
        placeholder='Select funnel'
        value={currentFilter?.funnelId || ''}
        onChange={(e) => handleFunnelChange(e.target.value)}
        width={'100%'}
        size={'sm'}
      >
        {funnels.map((funnel) => (
          <option key={funnel.id} value={funnel.id}>
            {funnel.name}
          </option>
        ))}
      </Select>

      {selectedFunnel && (
        <>
          <VStack align='stretch' spacing={2} width={'100%'}>
            <Text fontSize='sm' fontWeight='light'>
              Steps
            </Text>
            <CheckboxGroup
              value={currentFilter?.stepIds || []}
              onChange={(values) => handleStepToggle(values as string[])}
            >
              <VStack align='stretch' spacing={1}>
                {selectedFunnel.steps.map((step) => (
                  <Checkbox
                    key={step.id}
                    value={step.id}
                    fontWeight={'light'}
                    size={'sm'}
                  >
                    {step.name}
                  </Checkbox>
                ))}
              </VStack>
            </CheckboxGroup>
          </VStack>

          <VStack align='stretch' spacing={2} width={'100%'}>
            <Text fontSize='sm' fontWeight='light'>
              Step status
            </Text>
            <CheckboxGroup
              value={selectedSubStatuses}
              onChange={handleSubStatusChange}
            >
              <VStack align='stretch' spacing={1}>
                {[...allStatuses].map((status) => (
                  <Checkbox key={status} value={status.toString()} size={'sm'}>
                    {getSubStatusLabel(status)}
                  </Checkbox>
                ))}
              </VStack>
            </CheckboxGroup>
          </VStack>
        </>
      )}
    </VStack>
  );
};
