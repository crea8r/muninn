// src/features/smart-object-type/utils/config.ts
import { SmartObjectFieldConfig, SmartObjectFormConfig } from '../type';

export const normalizeFieldConfig = (
  field: string,
  config: any
): SmartObjectFieldConfig => {
  // Handle old format where config might be just the type string
  if (typeof config === 'string') {
    return {
      type: config,
      validation: {},
      meta: {
        order: 0,
        label: field,
      },
    };
  }

  // Handle old format where config might be { type: string }
  if (!config.validation && !config.meta) {
    return {
      type: config.type || 'string',
      validation: {},
      meta: {
        order: 0,
        label: field,
      },
    };
  }

  // Handle new format but ensure defaults
  return {
    type: config.type || 'string',
    validation: config.validation || {},
    meta: {
      order: config.meta?.order ?? 0,
      label: config.meta?.label ?? field,
      description: config.meta?.description,
      icon: config.meta?.icon,
    },
  };
};

export const normalizeFormConfigField = (fieldConfig: any) => {
  if (typeof fieldConfig === 'string') {
    return {
      type: fieldConfig,
      validation: {},
      meta: {
        order: 20,
        label: fieldConfig,
      },
    };
  }
  return fieldConfig;
};

// Normalize entire form config
export const normalizeFormConfig = (config: any): SmartObjectFormConfig => {
  const fields = Object.entries(config.fields || {}).reduce(
    (acc, [field, fieldConfig]) => ({
      ...acc,
      [field]: normalizeFieldConfig(field, fieldConfig),
    }),
    {}
  );

  return { fields };
};
