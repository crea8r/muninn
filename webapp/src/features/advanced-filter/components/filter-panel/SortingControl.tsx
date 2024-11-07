// components/filter-panel/sorting-control/SortingControl.tsx
import React, { useMemo } from 'react';
import {
  VStack,
  Text,
  Select,
  HStack,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Divider,
  Spacer,
} from '@chakra-ui/react';
import { TriangleUpIcon, TriangleDownIcon } from '@chakra-ui/icons';
import { useAdvancedFilter } from '../../contexts/AdvancedFilterContext';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import { ObjectType } from 'src/types';
import { STANDARD_SORT_OPTIONS, SortType } from '../../constants';

export const SortingControl: React.FC = () => {
  const { filterConfig, updateFilter } = useAdvancedFilter();
  const { globalData } = useGlobalContext();
  const objectTypes = globalData?.objectTypeData?.objectTypes || [];
  const filteredObjectTypes = filterConfig.typeIds || [];

  // Determine current sort type and values
  const currentSort = useMemo(() => {
    const sortBy = filterConfig.sortBy || 'created_at';
    if (sortBy.startsWith('type_value:')) {
      const [, typeId, field] = sortBy.split(':');
      return {
        type: 'type_value' as SortType,
        typeId,
        field,
      };
    }
    return {
      type: 'standard' as SortType,
      field: sortBy,
    };
  }, [filterConfig.sortBy]);

  // Handle sort type change
  const handleSortTypeChange = (type: SortType) => {
    if (type === 'standard') {
      updateFilter({
        sortBy: 'created_at',
        type_value_field: undefined,
      });
    } else {
      // Default to first object type and its first field if available
      const firstTypeId = filteredObjectTypes[0];
      const firstType = objectTypes.find(
        (t: ObjectType) => t.id === firstTypeId
      );
      if (firstType) {
        const firstField = Object.keys(firstType.fields)[0];
        updateFilter({
          sortBy: `type_value:${firstType.id}:${firstField}`,
          type_value_field: firstField,
        });
      }
    }
  };

  const toggleDirection = () => {
    updateFilter({ ascending: !filterConfig.ascending });
  };
  return (
    <VStack align='stretch' spacing={3}>
      <Divider my={2} />
      <Text fontWeight='bold' fontSize='md' color={'blue.500'}>
        Sort By
      </Text>

      <RadioGroup
        value={currentSort.type}
        onChange={(value) => handleSortTypeChange(value as SortType)}
      >
        <Stack>
          <Radio value='standard'>Standard Fields</Radio>
          <Radio
            value='type_value'
            isDisabled={filteredObjectTypes.length === 0}
          >
            Object Type Field
          </Radio>
        </Stack>
      </RadioGroup>

      {currentSort.type === 'standard' ? (
        // Standard field selection
        <Select
          size='sm'
          value={currentSort.field}
          onChange={(e) => updateFilter({ sortBy: e.target.value })}
        >
          {STANDARD_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      ) : (
        // Object type and field selection
        <VStack align='stretch' spacing={2}>
          <Select
            size='sm'
            value={currentSort.typeId}
            onChange={(e) => {
              const type = objectTypes.find(
                (t: ObjectType) => t.id === e.target.value
              );
              if (type) {
                const firstField = Object.keys(type.fields)[0];
                updateFilter({
                  sortBy: `type_value:${type.id}:${firstField}`,
                  type_value_field: firstField,
                });
              }
            }}
          >
            {objectTypes
              .filter((o: ObjectType) => filteredObjectTypes.includes(o.id))
              .map((type: ObjectType) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
          </Select>

          {currentSort.typeId && (
            <Select
              size='sm'
              value={currentSort.field}
              onChange={(e) => {
                updateFilter({
                  sortBy: `type_value:${currentSort.typeId}:${e.target.value}`,
                  type_value_field: e.target.value,
                });
              }}
            >
              {objectTypes.find((t: ObjectType) => t.id === currentSort.typeId)
                ?.fields &&
                Object.keys(
                  objectTypes.find(
                    (t: ObjectType) => t.id === currentSort.typeId
                  )!.fields
                ).map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
            </Select>
          )}
        </VStack>
      )}

      <HStack>
        <Text fontSize='sm' color='gray.600'>
          Order
        </Text>
        <Spacer />
        <Text fontSize='sm' color='gray.600'>
          {filterConfig.ascending ? 'Ascending' : 'Descending'}
        </Text>
        <IconButton
          aria-label='Toggle sort direction'
          icon={
            filterConfig.ascending ? <TriangleUpIcon /> : <TriangleDownIcon />
          }
          size='sm'
          onClick={toggleDirection}
        />
      </HStack>
    </VStack>
  );
};
