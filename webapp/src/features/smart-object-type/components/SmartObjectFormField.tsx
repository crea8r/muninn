// src/features/smart-object-type/components/SmartObjectFormField.tsx
import FaIconList from 'src/components/FaIconList';
import { FieldMeta, FormMode, SmartObjectFormConfig } from '../type';
import { normalizeFormConfigField } from '../utils/config';
import { ObjectTypeRegistryInstance as ObjectTypeRegistry } from '../utils/registry';
import {
  Box,
  FormControl,
  FormErrorMessage,
  HStack,
  Text,
} from '@chakra-ui/react';

const FieldHeader: React.FC<{
  field: string;
  meta: FieldMeta;
  required?: boolean;
}> = ({ field, meta, required }) => {
  const DefaultIcon = FaIconList['question'];
  const IconComponent = meta.icon ? FaIconList[meta.icon] : DefaultIcon;
  return (
    <Box>
      <HStack>
        <Box>{IconComponent}</Box>
        <Text fontWeight='medium'>{meta.label || field}</Text>
        {required && <Text color='red.500'>*</Text>}
      </HStack>
      {meta.description && (
        <Text fontSize='sm' color='gray.500' mt={1}>
          {meta.description}
        </Text>
      )}
    </Box>
  );
};

interface FormFieldWrapperProps {
  field: string;
  children: React.ReactNode;
  meta: FieldMeta;
  error?: string;
  required?: boolean;
}

export const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({
  field,
  children,
  meta,
  error,
  required = false,
}) => (
  <FormControl isInvalid={!!error}>
    <FieldHeader field={field} meta={meta} required={required} />
    {children}
    {error && <FormErrorMessage>{error}</FormErrorMessage>}
  </FormControl>
);

interface SmartObjectFormFieldProps {
  field: string;
  config: SmartObjectFormConfig['fields'][string];
  value?: any;
  error?: string;
  mode: FormMode;
  onChange?: (field: string, value: any, isValid: boolean) => void;
  onConfigChange?: (field: string, validation: any) => void;
}

export const SmartObjectFormField: React.FC<SmartObjectFormFieldProps> = ({
  field,
  config: rawConfig,
  value,
  error,
  mode,
  onChange,
  onConfigChange,
}) => {
  const config = normalizeFormConfigField(rawConfig);
  const typeImpl = ObjectTypeRegistry.get(config.type);
  if (!typeImpl) return null;

  const renderContent = () => {
    switch (mode) {
      case 'view':
        return (
          <typeImpl.Display value={value} validation={config.validation} />
        );

      case 'edit':
        return (
          <typeImpl.Input
            value={value}
            onChange={(newValue, isValid) =>
              onChange?.(field, newValue, isValid)
            }
            validation={config.validation}
          />
        );

      case 'configure':
        return (
          <typeImpl.Configure
            validation={config.validation}
            onChange={(validation) => onConfigChange?.(field, validation)}
          />
        );
    }
  };

  return (
    <FormFieldWrapper
      field={field}
      meta={config.meta}
      error={mode === 'edit' ? error : undefined}
      required={config.validation?.required}
    >
      {renderContent()}
    </FormFieldWrapper>
  );
};
