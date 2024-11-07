// components/filter-panel/type-value-filter/CriteriaBuilder.tsx
import React from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Select,
  Input,
  HStack,
  IconButton,
  Spacer,
  Text,
} from '@chakra-ui/react';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import { useAdvancedFilter } from 'src/features/advanced-filter/contexts/AdvancedFilterContext';
import { ObjectType } from 'src/types';
import { useUnsavedChangesContext } from 'src/contexts/unsaved-changes/UnsavedChange';
import { CloseIcon } from '@chakra-ui/icons';

interface CriteriaBuilderProps {
  value?: Record<string, string>;
  onChange: (criteria: Record<string, string>) => void;
  onRemove: () => void;
}

export const CriteriaBuilder: React.FC<CriteriaBuilderProps> = ({
  value = {},
  onChange,
  onRemove,
}) => {
  const { globalData } = useGlobalContext();
  const objectTypes = globalData?.objectTypeData?.objectTypes || [];
  const { filterConfig } = useAdvancedFilter();
  const { setDirty } = useUnsavedChangesContext();
  const filteredObjectTypeIds = filterConfig.typeIds;

  const handleTypeChange = (typeId: string) => {
    onChange({ typeId });
  };

  const handleFieldChange = (field: string) => {
    onChange({ ...value, field });
  };

  const handleValueChange = (fieldValue: string) => {
    setDirty(true);
    onChange({ ...value, value: fieldValue });
  };

  const selectedType = objectTypes.find((t) => t.id === value.typeId);
  const fields = selectedType ? Object.keys(selectedType.fields) : [];

  return (
    <VStack spacing={3} align='stretch'>
      <FormControl>
        <HStack alignItems={'center'} pb={2}>
          <Text fontSize='sm'>Object Type</Text>
          <Spacer />
          <IconButton
            aria-label='Remove criteria'
            icon={<CloseIcon />}
            size='xs'
            onClick={onRemove}
            variant={'ghost'}
          />
        </HStack>

        <Select
          value={value.typeId || ''}
          onChange={(e) => handleTypeChange(e.target.value)}
          placeholder='Select object type'
          size='sm'
        >
          {objectTypes
            .filter((o: ObjectType) => filteredObjectTypeIds?.includes(o.id))
            .map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
        </Select>
      </FormControl>

      {value.typeId && (
        <FormControl>
          <FormLabel fontSize='sm'>Field</FormLabel>
          <Select
            value={value.field || ''}
            onChange={(e) => handleFieldChange(e.target.value)}
            placeholder='Select field'
            size='sm'
          >
            {fields.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </Select>
        </FormControl>
      )}

      {value.field && (
        <FormControl>
          <FormLabel fontSize='sm'>Value (LIKE)</FormLabel>
          <Input
            size='sm'
            value={value.value || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder='Enter value...'
          />
        </FormControl>
      )}
    </VStack>
  );
};
