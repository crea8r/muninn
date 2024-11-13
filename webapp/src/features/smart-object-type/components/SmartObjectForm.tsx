import React, { useMemo } from 'react';
import { VStack } from '@chakra-ui/react';
import { SmartObjectFormField } from './SmartObjectFormField';
import { useSmartObjectForm } from '../hooks/useSmartObjectForm';
import {
  SmartObjectFormConfig,
  SmartObjectFormValues,
  FormMode,
} from '../type';

interface SmartObjectFormProps {
  config: SmartObjectFormConfig;
  initialValues?: SmartObjectFormValues;
  mode: FormMode;
  onChange?: (values: SmartObjectFormValues) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export const SmartObjectForm: React.FC<SmartObjectFormProps> = ({
  config: initialConfig,
  initialValues,
  mode,
  onChange,
  onValidationChange,
}) => {
  const { config, values, errors, handleFieldChange } = useSmartObjectForm({
    config: initialConfig,
    initialValues,
    mode,
    onChange,
    onValidationChange,
  });

  const sortedFields = useMemo(() => {
    return Object.entries(config.fields).sort(
      ([, a], [, b]) => (a.meta?.order ?? 0) - (b.meta?.order ?? 0)
    );
  }, [config]);

  return (
    <VStack spacing={4} align='stretch' width={'100%'}>
      {sortedFields.map(
        ([field, fieldConfig]) =>
          ((values[field] && mode === 'view') || mode === 'edit') && (
            <SmartObjectFormField
              key={field}
              field={field}
              config={fieldConfig}
              value={values[field]}
              error={errors[field]}
              mode={mode}
              onChange={handleFieldChange}
            />
          )
      )}
    </VStack>
  );
};
