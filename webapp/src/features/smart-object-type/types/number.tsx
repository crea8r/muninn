import { BaseValidation, ObjectTypeImplementation } from '../type';
import {
  FormControl,
  FormLabel,
  SimpleGrid,
  Switch,
  Text,
  VStack,
  Input,
} from '@chakra-ui/react';

// src/features/smart-object-type/types/number..tsx
interface NumberValidation extends BaseValidation {
  min?: number;
  max?: number;
}

const NumberDisplay: React.FC<{
  value: number;
  validation?: NumberValidation;
}> = ({ value, validation }) => {
  if (value === null || value === undefined) return null;
  return <Text>{value.toLocaleString()}</Text>;
};

const NumberInput: React.FC<{
  value: number;
  onChange: (value: number, isValid: boolean) => void;
  validation?: NumberValidation;
}> = ({ value, onChange, validation }) => {
  const handleChange = (val: number) => {
    const validationResult = NumberObjectType.validate(val, validation || {});
    onChange(val, validationResult === true);
  };

  return (
    <Input
      type='number'
      value={value}
      onChange={(e) =>
        handleChange(
          parseInt(e.target.value) || parseFloat(e.target.value) || 0
        )
      }
    />
  );
};

const NumberConfigure: React.FC<{
  validation?: NumberValidation;
  onChange: (validation: NumberValidation) => void;
}> = ({ validation = {}, onChange }) => {
  return (
    <VStack spacing={4} align='stretch'>
      <FormControl>
        <FormLabel>Required</FormLabel>
        <Switch
          isChecked={validation.required}
          onChange={(e) =>
            onChange({ ...validation, required: e.target.checked })
          }
        />
      </FormControl>

      <SimpleGrid columns={2} spacing={4}>
        <FormControl>
          <FormLabel>Minimum Value</FormLabel>
          <NumberInput
            value={validation.min}
            onChange={(val) =>
              onChange({
                ...validation,
                min: val,
              })
            }
          />
        </FormControl>

        <FormControl>
          <FormLabel>Maximum Value</FormLabel>
          <NumberInput
            value={validation.max}
            onChange={(val) =>
              onChange({
                ...validation,
                max: val,
              })
            }
          />
        </FormControl>
      </SimpleGrid>
    </VStack>
  );
};

export const NumberObjectType: ObjectTypeImplementation<
  NumberValidation,
  number
> = {
  type: 'number',

  validate: (value: number, validation: NumberValidation): true | string => {
    if (validation.required && (value === undefined || value === null)) {
      return 'This field is required';
    }

    if (validation.min !== undefined && value < validation.min) {
      return `Minimum value is ${validation.min}`;
    }

    if (validation.max !== undefined && value > validation.max) {
      return `Maximum value is ${validation.max}`;
    }

    return true;
  },

  Display: NumberDisplay,
  Input: NumberInput,
  Configure: NumberConfigure,
};
