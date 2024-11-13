// src/features/smart-object-type/types/object/index.tsx
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Switch,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  VStack,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useSpotLight } from 'src/contexts/SpotLightContext';
import { ObjectTypeImplementation, BaseValidation } from '../type';
import { useCallback } from 'react';

interface ObjectValidation extends BaseValidation {
  multiple?: boolean;
  min?: number; // Minimum number of objects when multiple is true
  max?: number; // Maximum number of objects when multiple is true
}

// Utility type for single/multiple object values
type ObjectValue =
  | {
      id: string;
      name: string;
      description?: string;
    }
  | null
  | string;

type ObjectArrayValue = Array<{
  id: string;
  name: string;
  description?: string;
}>;

const ObjectTag: React.FC<{
  object: { id: string; name: string; description?: string };
  onRemove?: () => void;
}> = ({ object, onRemove }) => (
  <Tag
    size='md'
    borderRadius='full'
    variant='solid'
    colorScheme='blue'
    _hover={{ background: 'blue.200', color: 'gray.700' }}
    title={object.description}
  >
    <TagLabel
      onClick={() => window.open(`/objects/${object.id}`, '_blank')}
      cursor={'pointer'}
    >
      {object.name}
    </TagLabel>
    {onRemove && <TagCloseButton onClick={onRemove} />}
  </Tag>
);

const ObjectDisplay: React.FC<{
  value: ObjectValue | ObjectArrayValue;
  validation?: ObjectValidation;
}> = ({ value, validation }) => {
  if (!value) return null;
  if (value && typeof value === 'string') {
    // backward compatibility
    return (
      <Text color={'red.500'}>
        Object id: {value}. This format is deprecated, please copy the id and
        reinput it.
      </Text>
    );
  }

  if (Array.isArray(value)) {
    return (
      <HStack spacing={2} wrap='wrap'>
        {value.map((obj) => (
          <ObjectTag key={obj.id} object={obj} />
        ))}
      </HStack>
    );
  }
  if (value && typeof value === 'object') {
    return <ObjectTag object={value} />;
  }
  return null;
};

const ObjectInput: React.FC<{
  value: ObjectValue | ObjectArrayValue;
  onChange: (value: ObjectValue | ObjectArrayValue, isValid: boolean) => void;
  validation?: ObjectValidation;
}> = ({ value, onChange, validation = {} }) => {
  const { openSpotLight } = useSpotLight();
  const handleSpotLightSelect = useCallback(
    (item) => {
      if (!item?.payload) return;

      const newObject = {
        id: item.payload.id,
        name: item.payload.name,
        description: item.payload.description,
      };

      let newValue: ObjectValue | ObjectArrayValue;
      let isValid: boolean;

      if (validation.multiple) {
        const currentArray = Array.isArray(value) ? value : [];
        // Check if object already exists
        if (currentArray.some((obj) => obj.id === newObject.id)) return;

        newValue = [...currentArray, newObject];
        // Validate against min/max
        isValid = true;
        if (validation.min && newValue.length < validation.min) {
          isValid = false;
        }
        if (validation.max && newValue.length > validation.max) {
          isValid = false;
        }
      } else {
        newValue = newObject;
        isValid = true;
      }

      onChange(newValue, isValid);
    },
    [onChange, validation, value]
  );

  const handleOpenSpotLight = () => {
    openSpotLight(['object'], () => handleSpotLightSelect);
  };

  const handleRemove = (objectId: string) => {
    if (!validation.multiple || !Array.isArray(value)) {
      onChange(null, !validation.required);
      return;
    }

    const newValue = value.filter((obj) => obj.id !== objectId);
    const isValid =
      (!validation.required && newValue.length === 0) ||
      ((!validation.min || newValue.length >= validation.min) &&
        (!validation.max || newValue.length <= validation.max));

    onChange(newValue, isValid);
  };

  return (
    <Box>
      <VStack align='stretch' spacing={2}>
        <HStack spacing={2} wrap='wrap'>
          {validation.multiple
            ? Array.isArray(value) &&
              value.map((obj) => (
                <ObjectTag
                  key={obj.id}
                  object={obj}
                  onRemove={() => handleRemove(obj.id)}
                />
              ))
            : value &&
              typeof value === 'object' &&
              !Array.isArray(value) && (
                <ObjectTag
                  object={value}
                  onRemove={() => handleRemove(value.id)}
                />
              )}
        </HStack>

        <Button
          leftIcon={<SearchIcon />}
          onClick={handleOpenSpotLight}
          size='sm'
          disabled={
            validation.multiple &&
            validation.max &&
            Array.isArray(value) &&
            value.length >= validation.max
          }
        >
          {validation.multiple ? 'Add Object' : 'Select Object'}
        </Button>

        {validation.multiple && (validation.min || validation.max) && (
          <Text fontSize='sm' color='gray.500'>
            {validation.min && validation.max
              ? `Select between ${validation.min} and ${validation.max} objects`
              : validation.min
              ? `Select at least ${validation.min} objects`
              : `Select up to ${validation.max} objects`}
          </Text>
        )}
      </VStack>
    </Box>
  );
};

const ObjectConfigure: React.FC<{
  validation?: ObjectValidation;
  onChange: (validation: ObjectValidation) => void;
}> = ({ validation = {}, onChange }) => {
  const handleChange = <K extends keyof ObjectValidation>(
    key: K,
    value: ObjectValidation[K]
  ) => {
    onChange({ ...validation, [key]: value });
  };

  return (
    <VStack spacing={4} align='stretch'>
      <FormControl>
        <FormLabel>Required</FormLabel>
        <Switch
          isChecked={validation.required}
          onChange={(e) => handleChange('required', e.target.checked)}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Allow Multiple Objects</FormLabel>
        <Switch
          isChecked={validation.multiple}
          onChange={(e) => {
            const newValidation = { ...validation, multiple: e.target.checked };
            if (!e.target.checked) {
              // Clear min/max when switching to single selection
              delete newValidation.min;
              delete newValidation.max;
            }
            onChange(newValidation);
          }}
        />
      </FormControl>

      {validation.multiple && (
        <>
          <FormControl>
            <FormLabel>Minimum Objects</FormLabel>
            <NumberInput
              value={validation.min || 0}
              min={0}
              onChange={(_, val) => handleChange('min', val)}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel>Maximum Objects</FormLabel>
            <NumberInput
              value={validation.max || 0}
              min={0}
              onChange={(_, val) => handleChange('max', val)}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </>
      )}
    </VStack>
  );
};

export const ObjectObjectType: ObjectTypeImplementation<
  ObjectValidation,
  ObjectValue | ObjectArrayValue
> = {
  type: 'object',

  validate: (value, validation): true | string => {
    if (!value) {
      return validation.required ? 'This field is required' : true;
    }

    if (validation.multiple && Array.isArray(value)) {
      if (validation.min && value.length < validation.min) {
        return `Select at least ${validation.min} objects`;
      }
      if (validation.max && value.length > validation.max) {
        return `Select at most ${validation.max} objects`;
      }
    }

    return true;
  },

  Display: ObjectDisplay,
  Input: ObjectInput,
  Configure: ObjectConfigure,
};
