// src/features/smart-object-type/types.ts
import FaIconList from 'src/components/FaIconList';
// Base interface for validation
export interface BaseValidation {
  required?: boolean;
}

// Base props for all components
interface BaseTypeProps<TValidation> {
  validation?: TValidation;
}

// Props for Display component
interface DisplayProps<TValue, TValidation> extends BaseTypeProps<TValidation> {
  value: TValue;
}

// Props for Input component
interface InputProps<TValue, TValidation> extends BaseTypeProps<TValidation> {
  value: TValue;
  onChange: (value: TValue, isValid: boolean) => void;
}

// Props for Configure component
interface ConfigureProps<TValidation> extends BaseTypeProps<TValidation> {
  onChange: (validation: TValidation) => void;
}

// Meta information for field display
export interface FieldMeta {
  order?: number;
  label?: string;
  description?: string;
  icon?: keyof typeof FaIconList;
}

// Base interface for all object type definitions
export interface ObjectTypeDefinition {
  type: string;
  validation?: BaseValidation;
  meta?: FieldMeta;
}

// Interface for object type implementations
export interface ObjectTypeImplementation<
  TValidation extends BaseValidation = BaseValidation,
  TValue = any
> {
  type: string;
  // Validation function returns true if valid, string error message if invalid
  validate: (value: TValue, validation: TValidation) => true | string;

  // Display component for viewing mode
  Display: React.ComponentType<DisplayProps<TValue, TValidation>>;

  // Input component for editing mode
  Input: React.ComponentType<InputProps<TValue, TValidation>>;

  // Configure component for configuration mode
  Configure: React.ComponentType<ConfigureProps<TValidation>>;
}

// Registry for storing object type implementations
export interface ObjectTypeRegistry {
  register: (implementation: ObjectTypeImplementation) => void;
  get: (type: string) => ObjectTypeImplementation | undefined;
  getAll: () => Map<string, ObjectTypeImplementation>;
}

// Form configuration interface
export interface SmartObjectFormConfig {
  fields: {
    [key: string]: SmartObjectFieldConfig;
  };
}

export interface SmartObjectFieldConfig {
  type: string;
  validation?: BaseValidation;
  meta?: Partial<FieldMeta>;
}

// Form values interface
export interface SmartObjectFormValues {
  [key: string]: any;
}

// Form mode
export type FormMode = 'view' | 'edit' | 'configure';
