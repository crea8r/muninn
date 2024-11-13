// src/features/smart-object-type/types/datetime/index.tsx
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
  VStack,
} from '@chakra-ui/react';
import { ObjectTypeImplementation, BaseValidation } from '../type';

// Initialize dayjs plugins
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

interface DateTimeValidation extends BaseValidation {
  min?: string; // ISO date string
  max?: string; // ISO date string
  displayMode: 'date' | 'datetime' | 'time' | 'fromNow';
  type: 'date' | 'datetime' | 'time';
}

const getDisplayFormat = (mode: DateTimeValidation['displayMode']): string => {
  switch (mode) {
    case 'date':
      return 'LL'; // e.g., "September 4, 1986"
    case 'datetime':
      return 'LLLL'; // e.g., "Thursday, September 4, 1986 8:30 PM"
    case 'time':
      return 'LT'; // e.g., "8:30 PM"
    default:
      return 'LLLL';
  }
};

const DateTimeDisplay: React.FC<{
  value: string;
  validation?: DateTimeValidation;
}> = ({ value, validation }) => {
  if (!value || !dayjs(value).isValid()) return null;

  const date = dayjs(value);
  const displayMode = validation?.displayMode || 'datetime';

  if (displayMode === 'fromNow') {
    return <Box>{date.fromNow()}</Box>;
  }

  return <Box>{date.format(getDisplayFormat(displayMode))}</Box>;
};

const DateTimeInput: React.FC<{
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  validation?: DateTimeValidation;
}> = ({
  value,
  onChange,
  validation = { type: 'datetime', displayMode: 'datetime' },
}) => {
  const handleChange = (newValue: string) => {
    const validationResult = DateTimeObjectType.validate(newValue, validation);
    onChange(newValue, validationResult === true);
  };

  const inputType =
    validation.type === 'time'
      ? 'time'
      : validation.type === 'date'
      ? 'date'
      : 'datetime-local';

  return (
    <Input
      type={inputType}
      value={dayjs(value).format(
        inputType === 'datetime-local' ? 'YYYY-MM-DDTHH:mm' : 'YYYY-MM-DD'
      )}
      onChange={(e) => handleChange(e.target.value)}
      min={
        validation.min
          ? dayjs(validation.min).format('YYYY-MM-DDTHH:mm')
          : undefined
      }
      max={
        validation.max
          ? dayjs(validation.max).format('YYYY-MM-DDTHH:mm')
          : undefined
      }
    />
  );
};

const DateTimeConfigure: React.FC<{
  validation?: DateTimeValidation;
  onChange: (validation: DateTimeValidation) => void;
}> = ({
  validation = { type: 'datetime', displayMode: 'datetime' },
  onChange,
}) => {
  const handleChange = (key: keyof DateTimeValidation, value: any) => {
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
        <FormLabel>Input Type</FormLabel>
        <Select
          value={validation.type}
          onChange={(e) => handleChange('type', e.target.value)}
        >
          <option value='date'>Date Only</option>
          <option value='datetime'>Date and Time</option>
          <option value='time'>Time Only</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>Display Mode</FormLabel>
        <Select
          value={validation.displayMode}
          onChange={(e) => handleChange('displayMode', e.target.value)}
        >
          <option value='date'>Date Only</option>
          <option value='datetime'>Date and Time</option>
          <option value='time'>Time Only</option>
          <option value='fromNow'>Time Ago / From Now</option>
        </Select>
      </FormControl>

      {validation.type !== 'time' && (
        <>
          <FormControl>
            <FormLabel>Minimum Date</FormLabel>
            <Input
              type='datetime-local'
              value={validation.min || ''}
              onChange={(e) => handleChange('min', e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Maximum Date</FormLabel>
            <Input
              type='datetime-local'
              value={validation.max || ''}
              onChange={(e) => handleChange('max', e.target.value)}
            />
          </FormControl>
        </>
      )}
    </VStack>
  );
};

export const DateTimeObjectType: ObjectTypeImplementation<
  DateTimeValidation,
  string
> = {
  type: 'datetime',

  validate: (value, validation): true | string => {
    if (!value) {
      if (validation.required) {
        return 'This field is required';
      }
      return true;
    }

    const date = dayjs(value);
    if (!date.isValid()) {
      return 'Invalid date';
    }

    if (validation.min && date.isBefore(dayjs(validation.min))) {
      return `Date must be after ${dayjs(validation.min).format('LLLL')}`;
    }

    if (validation.max && date.isAfter(dayjs(validation.max))) {
      return `Date must be before ${dayjs(validation.max).format('LLLL')}`;
    }

    return true;
  },

  Display: DateTimeDisplay,
  Input: DateTimeInput,
  Configure: DateTimeConfigure,
};
