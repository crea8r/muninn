// components/filter-panel/type-value-filter/TypeValueCriteria.tsx
import React from 'react';
import { VStack, HStack, Button, Text, Box } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { CriteriaBuilder } from './CriteriaBuilder';
import { TypeValueFilter as TypeValueFilterInterface } from '../../../types/criteria';
import { useAdvancedFilter } from '../../../contexts/AdvancedFilterContext';
import { MAX_CRITERIA } from '../../../constants';

export const TypeValueFilter: React.FC = () => {
  const { filterConfig, updateFilter } = useAdvancedFilter();
  const criteriaCount = Object.keys(
    filterConfig.typeValueCriteria || {}
  ).length;

  const handleCriteriaChange = (
    index: number,
    criteria: Record<string, string> | undefined
  ) => {
    const key = `criteria${index + 1}` as keyof TypeValueFilterInterface;
    const newCriteria = { ...filterConfig.typeValueCriteria };

    if (criteria) {
      newCriteria[key] = criteria;
    } else {
      delete newCriteria[key];
    }

    updateFilter({ typeValueCriteria: newCriteria });
  };

  const addCriteria = () => {
    if (criteriaCount >= MAX_CRITERIA) return;
    const newIndex = criteriaCount + 1;
    handleCriteriaChange(newIndex - 1, {});
  };

  return (
    <VStack align='stretch' spacing={4} overflowX={'hidden'}>
      <HStack justify='space-between'>
        <Text fontWeight='medium' fontSize='sm'>
          Type Value Filters
        </Text>
        {criteriaCount < MAX_CRITERIA && (
          <Button size='sm' leftIcon={<AddIcon />} onClick={addCriteria}>
            Add Filter
          </Button>
        )}
      </HStack>

      {Array.from({ length: MAX_CRITERIA }).map((_, index) => {
        const key = `criteria${index + 1}` as keyof TypeValueFilterInterface;
        const criteria = filterConfig.typeValueCriteria?.[key];

        if (!criteria && index >= criteriaCount) return null;

        return (
          <Box
            key={index}
            p={3}
            borderWidth={1}
            borderRadius='md'
            position='relative'
          >
            <CriteriaBuilder
              value={criteria}
              onChange={(newCriteria) =>
                handleCriteriaChange(index, newCriteria)
              }
              onRemove={() => handleCriteriaChange(index, undefined)}
            />
          </Box>
        );
      })}
    </VStack>
  );
};
