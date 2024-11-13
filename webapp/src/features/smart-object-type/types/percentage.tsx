import { BaseValidation, ObjectTypeImplementation } from '../type';
import {
  FormControl,
  FormLabel,
  SimpleGrid,
  Switch,
  Text,
  VStack,
  Input,
  Box,
} from '@chakra-ui/react';

import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from '@chakra-ui/react';

// src/features/smart-object-type/types/number..tsx
interface PercentageValidation extends BaseValidation {
  min?: number;
  max?: number;
}

const PercentageDisplay: React.FC<{
  value: number;
  validation?: PercentageValidation;
}> = ({ value, validation }) => {
  return <Text>{value ? value.toLocaleString() : 0}%</Text>;
};

const PercentageInput: React.FC<{
  value: number;
  onChange: (value: number, isValid: boolean) => void;
  validation?: PercentageValidation;
}> = ({ value, onChange, validation }) => {
  const handleChange = (val: number) => {
    const validationResult = PercentageObjectType.validate(
      val,
      validation || {}
    );
    onChange(val, validationResult === true);
  };
  const min = validation?.min || 0;
  const max = validation?.max || 100;
  return (
    <>
      <Slider
        aria-label='percentage-slider'
        value={value}
        min={min}
        max={max}
        onChange={handleChange} // Add your onChange handler here
        mt={6}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb boxSize={6} style={{ position: 'relative' }}>
          <Box position={'absolute'} top={'-24px'} fontSize={'sm'}>
            {value}%
          </Box>
          <Box color='tomato' />
        </SliderThumb>
      </Slider>
    </>
  );
};

const PercentageConfigure: React.FC<{
  validation?: PercentageValidation;
  onChange: (validation: PercentageValidation) => void;
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
          <Input
            value={validation?.min || 0}
            onChange={(e) =>
              onChange({
                ...validation,
                min: parseInt(e.target.value) || 0,
              })
            }
          />
        </FormControl>

        <FormControl>
          <FormLabel>Maximum Value</FormLabel>
          <Input
            value={validation?.max || 100}
            onChange={(e) =>
              onChange({
                ...validation,
                max: parseInt(e.target.value) || 100,
              })
            }
          />
        </FormControl>
      </SimpleGrid>
    </VStack>
  );
};

export const PercentageObjectType: ObjectTypeImplementation<
  PercentageValidation,
  number
> = {
  type: 'percentage',

  validate: (
    value: number,
    validation: PercentageValidation
  ): true | string => {
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

  Display: PercentageDisplay,
  Input: PercentageInput,
  Configure: PercentageConfigure,
};
