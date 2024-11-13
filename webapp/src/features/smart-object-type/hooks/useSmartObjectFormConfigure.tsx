import { useState, useEffect, useCallback, useMemo } from 'react';
import { ObjectTypeRegistryInstance as ObjectTypeRegistry } from '../utils/registry';
import { SmartObjectFormConfig, SmartObjectFormValues } from '../type';
import { produce } from 'immer';
import { normalizeFormConfig } from '../utils/config';

interface FieldError {
  field?: string;
  message: string;
}

interface UseSmartObjectFormConigureProps {
  initialConfig: SmartObjectFormConfig;
  onChange?: (values: SmartObjectFormValues) => void;
  onConfigChange?: (config: SmartObjectFormConfig) => void;
}

export const useSmartObjectFormConfigure = ({
  initialConfig,
  onChange,
  onConfigChange,
}: UseSmartObjectFormConigureProps) => {
  const [config, setConfig] = useState(() =>
    // creates a deep copy of the initialConfig
    // to avoid mutating the original object and trigger unwanted hooks
    normalizeFormConfig(structuredClone(initialConfig))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draggedField, setDraggedField] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, FieldError>>(
    {}
  );
  // Reset state when initialConfig changes
  useEffect(() => {
    setConfig(normalizeFormConfig(initialConfig));
    setErrors({});
    setDraggedField(null);
    setFieldErrors({});
  }, [initialConfig]);

  const validateFieldName = useCallback(
    (fieldName: string, currentField?: string): FieldError | null => {
      if (!fieldName.trim()) {
        return { message: 'Field name cannot be empty' };
      }

      if (fieldName in config.fields && fieldName !== currentField) {
        return { message: 'Field name must be unique' };
      }

      return null;
    },
    [config.fields]
  );

  const addField = useCallback(
    (fieldName: string, type: string) => {
      const error = validateFieldName(fieldName);
      if (error) {
        setFieldErrors((prev) => ({ ...prev, [fieldName]: error }));
        return false;
      }

      setConfig((prev) => {
        const newConfig = {
          ...prev,
          fields: {
            ...prev.fields,
            [fieldName]: {
              type,
              meta: {
                order: Object.keys(prev.fields).length,
                label: fieldName,
              },
            },
          },
        };
        onConfigChange?.(newConfig);
        return newConfig;
      });
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      return true;
    },
    [validateFieldName, onConfigChange]
  );

  const removeField = useCallback(
    (fieldName: string) => {
      setConfig((prev) => {
        let newConfig = { ...prev };
        delete newConfig.fields[fieldName];
        onConfigChange?.(newConfig);
        return { ...newConfig };
      });

      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    },
    [onConfigChange]
  );

  const validateField = useCallback(
    (field: string) => {
      const fieldConfig = config.fields[field];
      if (!fieldConfig) return true;

      const typeImpl = ObjectTypeRegistry.get(fieldConfig.type);
      if (!typeImpl) return true;
    },
    [config.fields]
  );

  const handleConfigChange = useCallback(
    (
      field: string,
      changes: Partial<SmartObjectFormConfig['fields'][string]>
    ) => {
      setConfig((prev) => {
        const newConfig = produce(prev, (draft) => {
          draft.fields[field] = {
            ...draft.fields[field],
            ...changes,
          };
        });
        onConfigChange?.(newConfig);
        return newConfig;
      });
    },
    [onConfigChange]
  );

  const handleFieldOrder = useCallback(
    (sourceIndex: number, targetIndex: number) => {
      setConfig((prev) => {
        const fields = Object.entries(prev.fields);
        const [removed] = fields.splice(sourceIndex, 1);
        fields.splice(targetIndex, 0, removed);

        const newConfig = {
          ...prev,
          fields: fields.reduce(
            (acc, [key, value], index) => ({
              ...acc,
              [key]: {
                ...value,
                meta: {
                  ...value.meta,
                  order: index,
                },
              },
            }),
            {}
          ),
        };

        onConfigChange?.(newConfig);
        return newConfig;
      });
    },
    [onConfigChange]
  );

  const isValid = useMemo(
    () => Object.values(errors).every((error) => !error),
    [errors]
  );

  return {
    config,
    errors,
    fieldErrors,
    handleConfigChange,
    handleFieldOrder,
    setDraggedField,
    draggedField,
    isValid,
    addField,
    removeField,
    validateField,
  };
};
