import { BaseValidation, ObjectTypeImplementation } from '../type';
import {
  Badge,
  FormControl,
  FormLabel,
  Select,
  Switch,
  VStack,
} from '@chakra-ui/react';

// src/features/smart-object-type/types/string/index.tsx
interface YesNoValidation extends BaseValidation {}

const YesNoDisplay: React.FC<{ value: string; validation: any }> = ({
  value,
  validation,
}) => {
  return (
    <Badge
      background={value === 'yes' ? 'blue' : value === 'no' ? 'red' : 'gray'}
      color={'white'}
    >
      {value === 'yes' ? 'YES' : value === 'no' ? 'NO' : 'N/A'}
    </Badge>
  );
};

const StringInput: React.FC<{
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  validation?: YesNoValidation;
}> = ({ value, onChange, validation }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value, true);
  };

  return (
    <Select onChange={handleChange} value={value}>
      <option value=''>Select</option>
      <option value='yes'>Yes</option>
      <option value='no'>No</option>
    </Select>
  );
};

const StringConfigure: React.FC<{ validation: any; onChange: any }> = ({
  validation,
  onChange,
}) => {
  const handleChange = (field: keyof YesNoValidation, value: any) => {
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
    </VStack>
  );
};

export const YesNoObjectType: ObjectTypeImplementation<
  YesNoValidation,
  string
> = {
  type: 'yesno',

  validate: (value: string, validation: YesNoValidation): true | string => {
    if (validation.required && !['yes', 'no'].includes(value)) {
      return 'This field is required';
    }
    return true;
  },

  Display: YesNoDisplay,
  Input: StringInput,
  Configure: StringConfigure,
};
