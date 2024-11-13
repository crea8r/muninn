import { useState, useEffect, useCallback, useMemo } from 'react';
import { ObjectTypeRegistryInstance as ObjectTypeRegistry } from '../utils/registry';
import {
  FormMode,
  SmartObjectFormConfig,
  SmartObjectFormValues,
} from '../type';
import { normalizeFormConfig } from '../utils/config';

interface FieldError {
  field?: string;
  message: string;
}

interface UseSmartObjectFormProps {
  config: SmartObjectFormConfig;
  initialValues?: SmartObjectFormValues;
  mode: FormMode;
  onChange?: (values: SmartObjectFormValues) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export const useSmartObjectForm = ({
  config: initialConfig,
  initialValues = {},
  mode,
  onChange,
  onValidationChange,
}: UseSmartObjectFormProps) => {
  const config = normalizeFormConfig(structuredClone(initialConfig));
  const [values, setValues] = useState<SmartObjectFormValues>(
    structuredClone(initialValues)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, FieldError>>(
    {}
  );
  // Reset state when initialConfig changes
  useEffect(() => {
    setValues(initialValues);
    setErrors({});
    setFieldErrors({});
  }, [initialValues]);

  const validateField = useCallback(
    (field: string, value: any) => {
      const fieldConfig = config.fields[field];
      if (!fieldConfig) return true;

      const typeImpl = ObjectTypeRegistry.get(fieldConfig.type);
      if (!typeImpl) return true;

      return typeImpl.validate(value, fieldConfig.validation || {});
    },
    [config.fields]
  );

  const handleFieldChange = useCallback(
    (field: string, value: any, isValid: boolean) => {
      if (mode !== 'edit') return;

      setValues((prev) => {
        const newValues = { ...prev, [field]: value };
        onChange?.(newValues);
        return newValues;
      });

      const validationResult = validateField(field, value);
      setErrors((prev) => ({
        ...prev,
        [field]: validationResult === true ? '' : validationResult,
      }));
    },
    [mode, onChange, validateField]
  );

  const isValid = useMemo(
    () => Object.values(errors).every((error) => !error),
    [errors]
  );

  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);
  return {
    config,
    values,
    errors,
    fieldErrors,
    handleFieldChange,
    isValid,
  };
};
