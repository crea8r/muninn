// Add active filters display
// components/filter-panel/ActiveFilters.tsx
import React from 'react';
import {
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Box,
  Text,
  Divider,
} from '@chakra-ui/react';
import { useAdvancedFilter } from '../../contexts/AdvancedFilterContext';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import { substatus } from 'src/utils';
import { STANDARD_SORT_OPTIONS } from '../../constants';

export const ActiveFilters: React.FC = () => {
  const { filterConfig, updateFilter } = useAdvancedFilter();
  const { globalData } = useGlobalContext();
  const objectTypes = globalData?.objectTypeData?.objectTypes || [];
  const funnels = globalData?.funnelData?.funnels || [];
  const tags = globalData?.tagData?.tags || [];

  const removeCriteria = (criteriaKey: string) => {
    const newCriteria: any = { ...filterConfig.typeValueCriteria };
    delete newCriteria[criteriaKey];
    updateFilter({
      typeValueCriteria:
        Object.keys(newCriteria).length > 0 ? newCriteria : undefined,
    });
  };

  const renderFunnelStepFilter = () => {
    const funnelFilter = filterConfig.funnelStepFilter;
    if (!funnelFilter?.funnelId) return null;

    const funnel = funnels.find((f) => f.id === funnelFilter.funnelId);
    if (!funnel) return null;

    return (
      <>
        <Tag size='md' variant='subtle' colorScheme='purple'>
          <TagLabel>Funnel: {funnel.name}</TagLabel>
        </Tag>

        {funnelFilter.stepIds.length < funnel.steps.length && (
          <Tag size='md' variant='subtle' colorScheme='purple'>
            <TagLabel>
              Steps: {funnelFilter.stepIds.length}/{funnel.steps.length}
            </TagLabel>
          </Tag>
        )}

        {funnelFilter.subStatuses.length > 0 && (
          <Tag size='md' variant='subtle' colorScheme='purple'>
            <TagLabel>
              Sub-status:{' '}
              {funnelFilter.subStatuses.map((s) => substatus(s)).join(', ')}
            </TagLabel>
          </Tag>
        )}
      </>
    );
  };

  const renderTagFilters = () => {
    const tagIds = filterConfig.tagIds;
    if (!tagIds?.length) return null;

    const selectedTags = tags.filter((tag) => tagIds.includes(tag.id));
    if (!selectedTags.length) return null;

    return selectedTags.map((tag) => (
      <Tag
        key={tag.id}
        size='md'
        variant='subtle'
        backgroundColor={tag.color_schema.background}
        color={tag.color_schema.text}
      >
        <TagLabel>{tag.name}</TagLabel>
        <TagCloseButton
          onClick={() => {
            updateFilter({
              tagIds: tagIds.filter((id) => id !== tag.id),
            });
          }}
        />
      </Tag>
    ));
  };

  // Update ActiveFilters component (just add type filters handling)
  const renderTypeFilters = () => {
    const typeIds = filterConfig.typeIds;
    if (!typeIds?.length) return null;
    const selectedTypes = objectTypes.filter((objType) =>
      typeIds.includes(objType.id)
    );
    if (!objectTypes.length) return null;

    return selectedTypes.map((type) => (
      <Tag key={type.id} size='md' variant='subtle' colorScheme='blue'>
        <TagLabel>{type.name}</TagLabel>
        <TagCloseButton
          onClick={() => {
            updateFilter({
              typeIds: typeIds.filter((id) => id !== type.id),
            });
          }}
        />
      </Tag>
    ));
  };

  const renderTypeValueCriteria = () => {
    if (!filterConfig.typeValueCriteria) return null;
    return window.Object.entries(filterConfig.typeValueCriteria).map(
      ([key, criteria]) => {
        if (!criteria.typeId || !criteria.field || !criteria.value) return null;

        const objectType = objectTypes.find((t) => t.id === criteria.typeId);
        const label = `${objectType?.name || 'Type'}: ${criteria.field} LIKE ${
          criteria.value
        }`;

        return (
          <Tag key={key} size='md' variant='subtle' colorScheme='blue'>
            <TagLabel>{label}</TagLabel>
            <TagCloseButton onClick={() => removeCriteria(key)} />
          </Tag>
        );
      }
    );
  };

  const renderSortingFilter = () => {
    if (!filterConfig.sortBy) return null;

    let sortLabel = '';
    if (filterConfig.sortBy.startsWith('type_value:')) {
      const [, typeId, field] = filterConfig.sortBy.split(':');
      const objectType = objectTypes.find((t) => t.id === typeId);
      sortLabel = `${objectType?.name}: ${field}`;
    } else {
      const standardOption = STANDARD_SORT_OPTIONS.find(
        (opt) => opt.value === filterConfig.sortBy
      );
      sortLabel = standardOption?.label || filterConfig.sortBy;
    }

    return (
      <Tag size='md' variant='subtle' colorScheme='purple'>
        <TagLabel>
          Sort: {sortLabel} ({filterConfig.ascending ? '↑' : '↓'})
        </TagLabel>
      </Tag>
    );
  };

  return (
    <Box>
      <Divider my={2} />
      <Text fontSize='md' fontWeight='bold' mb={2} color={'blue.500'}>
        Filters
      </Text>
      <HStack spacing={2} flexWrap='wrap'>
        {renderTypeFilters()}
        {renderTagFilters()}
        {renderFunnelStepFilter()}
        {renderTypeValueCriteria()}
        {renderSortingFilter()}
      </HStack>
    </Box>
  );
};