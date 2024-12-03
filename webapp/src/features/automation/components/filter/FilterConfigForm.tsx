// src/features/automation/components/filter/FilterConfigForm.tsx
import React, { useEffect, useState } from 'react';
import { Tag, TagLabel, TagCloseButton, Flex } from '@chakra-ui/react';
import { CoreFilterConfig } from 'src/types/FilterConfig';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import { substatus } from 'src/utils';

interface FilterConfigFormProps {
  value: CoreFilterConfig;
  onChange: (config: CoreFilterConfig) => void;
}

export const FilterConfigForm: React.FC<FilterConfigFormProps> = ({
  value,
  onChange,
}) => {
  const { globalData, getTagsMeta } = useGlobalContext();
  const [tags, setTags] = useState<any[]>([]);
  useEffect(() => {
    getTagsMeta(value.tagIds).then((tags) => {
      setTags(tags);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.tagIds]);
  const renderSearch = () => {
    if (!value.search) return null;

    return (
      <Tag size='md' variant='subtle' colorScheme='purple'>
        <TagLabel>Search: {value.search}</TagLabel>
        <TagCloseButton
          onClick={() => {
            onChange({ ...value, search: '' });
          }}
        />
      </Tag>
    );
  };

  const renderTagFilters = () => {
    return tags
      .filter((tag) => value?.tagIds?.includes(tag.id))
      .map((tag: any) => {
        return (
          <Tag
            size='md'
            variant='subtle'
            key={tag.id}
            color={tag.color_schema.text}
            backgroundColor={tag.color_schema.background}
          >
            <TagLabel>{tag.name}</TagLabel>
            <TagCloseButton
              onClick={() => {
                onChange({
                  ...value,
                  tagIds: value.tagIds.filter((t) => t !== tag.id),
                });
              }}
            />
          </Tag>
        );
      });
  };

  const renderTypeFilters = () => {
    const objectTypes = globalData?.objectTypeData?.objectTypes || [];
    const typeIds = value.typeIds;
    if (!typeIds?.length) return null;
    const selectedTypes = objectTypes.filter((objType) =>
      typeIds?.includes(objType.id)
    );
    if (!objectTypes.length) return null;

    return selectedTypes.map((type) => (
      <Tag key={type.id} size='md' variant='outline' colorScheme='blue'>
        <TagLabel>Type: {type.name}</TagLabel>
        <TagCloseButton
          onClick={() => {
            onChange({
              ...value,
              typeIds: typeIds.filter((id) => id !== type.id),
            });
          }}
        />
      </Tag>
    ));
  };

  const renderTypeValueCriteria = () => {
    if (!value.typeValueCriteria) return null;
    const objectTypes = globalData?.objectTypeData?.objectTypes || [];
    return window.Object.entries(value.typeValueCriteria).map(
      ([key, criteria]) => {
        if (!criteria.typeId || !criteria.field || !criteria.value) return null;

        const objectType = objectTypes.find((t) => t.id === criteria.typeId);
        const label = `${objectType?.name || 'Type'}: ${criteria.field} LIKE ${
          criteria.value
        }`;

        return (
          <Tag key={key} size='md' variant='outline' colorScheme='blue'>
            <TagLabel>{label}</TagLabel>
            <TagCloseButton
              onClick={() => {
                const newCriteria = { ...value.typeValueCriteria };
                delete newCriteria[key];
                onChange({
                  ...value,
                  typeValueCriteria: newCriteria,
                });
              }}
            />
          </Tag>
        );
      }
    );
  };

  const renderFunnelFilter = () => {
    const funnels = globalData?.funnelData?.funnels || [];
    const funnelFilter = value.funnelStepFilter;
    if (!funnelFilter?.funnelId) return null;

    const funnel = funnels.find((f) => f.id === funnelFilter.funnelId);
    if (!funnel) return null;
    return (
      <Flex flexWrap={'wrap'} overflowX={'hidden'} gap={2}>
        <Tag size='md' variant='subtle' colorScheme='purple'>
          <TagLabel>Funnel: {funnel.name}</TagLabel>
        </Tag>

        {funnelFilter.stepIds?.length < funnel.steps?.length && (
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
      </Flex>
    );
  };
  return (
    <Flex gap={2} align='stretch' width={'100%'} flexWrap={'wrap'}>
      {renderSearch()}
      {renderTypeFilters()}
      {renderTypeValueCriteria()}
      {renderFunnelFilter()}
      {renderTagFilters()}
    </Flex>
  );
};
