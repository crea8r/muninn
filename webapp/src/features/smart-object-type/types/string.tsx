import { BaseValidation, ObjectTypeImplementation } from '../type';
import {
  FormControl,
  FormLabel,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Switch,
  Text,
  VStack,
} from '@chakra-ui/react';

// src/features/smart-object-type/types/string/index.tsx
interface StringValidation extends BaseValidation {
  regex?: string;
  regexMessage?: string;
  maxLength?: number;
  minLength?: number;
}

const StringDisplay: React.FC<{ value: string; validation: any }> = ({
  value,
  validation,
}) => {
  // if value is url then return a link
  if (value?.startsWith('http')) {
    return (
      <Text
        onClick={() => window.open(value.toString(), '_blank')}
        color={'blue.500'}
        textDecoration={'underline'}
        cursor={'pointer'}
      >
        {value.toString()}
      </Text>
    );
  }
  return <Text>{value?.toString()}</Text>;
};

const StringInput: React.FC<{
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  validation?: StringValidation;
}> = ({ value, onChange, validation }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Validate the new value
    const validationResult = StringObjectType.validate(
      newValue,
      validation || {}
    );
    const isValid = validationResult === true;

    onChange(newValue, isValid);
  };

  return (
    <Input
      value={value}
      onChange={handleChange}
      maxLength={validation?.maxLength}
    />
  );
};

const StringConfigure: React.FC<{ validation: any; onChange: any }> = ({
  validation,
  onChange,
}) => {
  const handleChange = (field: keyof StringValidation, value: any) => {
    onChange({
      ...validation,
      [field]: value,
    });
  };

  return (
    <VStack align='stretch' spacing={3}>
      <FormControl>
        <FormLabel>Required</FormLabel>
        <Switch
          isChecked={validation?.required}
          onChange={(e) => handleChange('required', e.target.checked)}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Minimum Length</FormLabel>
        <NumberInput
          value={validation?.minLength || 0}
          onChange={(value) => handleChange('minLength', parseInt(value))}
          min={0}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>

      <FormControl>
        <FormLabel>Maximum Length</FormLabel>
        <NumberInput
          value={validation?.maxLength || 200}
          onChange={(value) => handleChange('maxLength', parseInt(value))}
          min={0}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>

      <FormControl>
        <FormLabel>Regex Pattern</FormLabel>
        <Input
          value={validation?.regex || ''}
          onChange={(e) => handleChange('regex', e.target.value)}
          placeholder='regex pattern'
        />
      </FormControl>

      <FormControl>
        <FormLabel>Regex Error Message</FormLabel>
        <Input
          value={validation?.regexMessage || ''}
          onChange={(e) => handleChange('regexMessage', e.target.value)}
        />
      </FormControl>
    </VStack>
  );
};

export const StringObjectType: ObjectTypeImplementation<
  StringValidation,
  string
> = {
  type: 'string',

  validate: (value: string, validation: StringValidation): true | string => {
    if (validation.required && !value) {
      return 'This field is required';
    }

    if (validation.minLength && value.length < validation.minLength) {
      return `Minimum length is ${validation.minLength} characters`;
    }

    if (validation.maxLength && value.length > validation.maxLength) {
      return `Maximum length is ${validation.maxLength} characters`;
    }

    if (validation.regex) {
      const regex = new RegExp(validation.regex);
      if (!regex.test(value)) {
        return validation.regexMessage || 'Invalid format';
      }
    }

    return true;
  },

  Display: StringDisplay,
  Input: StringInput,
  Configure: StringConfigure,
};
