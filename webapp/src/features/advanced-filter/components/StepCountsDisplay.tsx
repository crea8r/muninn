import { useGlobalContext } from 'src/contexts/GlobalContext';
import { FunnelStepFilter } from '../types/filters';
import { HStack, VStack, Text, Flex, Box } from '@chakra-ui/react';
import React from 'react';
import { useAdvancedFilter } from '../contexts/AdvancedFilterContext';

// components/StepCountsDisplay.tsx
interface StepCountsDisplayProps {
  totalCount: number;
  stepCounts: Record<string, number>;
  funnelStepFilter: FunnelStepFilter;
}

export const StepCountsDisplay: React.FC<StepCountsDisplayProps> = ({
  totalCount,
  stepCounts,
  funnelStepFilter,
}) => {
  const { globalData } = useGlobalContext();
  const funnel = globalData?.funnelData?.funnels.find(
    (f) => f.id === funnelStepFilter.funnelId
  );
  const { filterConfig, updateFilter } = useAdvancedFilter();
  const setStepFilter = (stepId: string) => {
    if (!filterConfig.funnelStepFilter) return;
    updateFilter({
      ...filterConfig,
      funnelStepFilter: {
        ...filterConfig.funnelStepFilter,
        stepIds: [stepId],
      },
    });
  };

  if (!funnel) return null;

  return (
    <VStack spacing={2} align='stretch'>
      <HStack justify='space-between'>
        <Text fontWeight='medium'>Step Distribution</Text>
        <Text color='gray.600'>Total: {totalCount}</Text>
      </HStack>
      <Flex gap={2} overflowX={'scroll'} pb={2}>
        {funnel.steps?.map((step, index) => {
          const count = stepCounts[step.id] || 0;
          const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;

          return (
            <React.Fragment key={step.id}>
              {index > 0 && (
                <Box alignSelf='center' color='gray.400'>
                  →
                </Box>
              )}
              <Box
                title={step.name}
                p={2}
                borderWidth={1}
                borderRadius='md'
                borderColor={
                  funnelStepFilter.stepIds.includes(step.id)
                    ? 'blue.200'
                    : 'gray.200'
                }
                bg={
                  funnelStepFilter.stepIds.includes(step.id)
                    ? 'blue.50'
                    : 'white'
                }
                onClick={() => setStepFilter(step.id)}
                cursor={'pointer'}
              >
                <VStack spacing={1}>
                  <Text
                    fontSize='sm'
                    fontWeight='medium'
                    overflow={'hidden'}
                    textOverflow={'ellipsis'}
                    whiteSpace={'nowrap'}
                  >
                    {step.name}
                  </Text>
                  <Text fontSize='sm'>{count}</Text>
                  <Text fontSize='xs' color='gray.600'>
                    {percentage.toFixed(1)}%
                  </Text>
                </VStack>
              </Box>
            </React.Fragment>
          );
        })}
      </Flex>
    </VStack>
  );
};
