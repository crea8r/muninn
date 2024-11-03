// constants/predefined-views.ts
import { PredefinedViewConfig } from '../types/view-config';
import { STANDARD_COLUMNS } from './default-columns';

export const PREDEFINED_VIEWS: Record<string, PredefinedViewConfig> = {
  tagView: {
    id: 'tag-view',
    name: 'Tag View',
    description: 'Display objects with specific tag',
    getConfig: (params) => ({
      displayMode: 'table',
      density: 'comfortable',
      columns: STANDARD_COLUMNS.map((col, index) => ({
        field: col.field,
        width: col.width,
        visible: col.defaultVisible,
        order: index,
        formatType: col.formatType,
      })),
    }),
    allowCustomization: true,
    defaultColumns: STANDARD_COLUMNS.map((col, index) => ({
      field: col.field,
      width: col.width,
      visible: col.defaultVisible,
      order: index,
      formatType: col.formatType,
    })),
    restrictedColumns: ['name'],
    requiredColumns: ['name', 'created_at'],
  },

  funnelView: {
    id: 'funnel-view',
    name: 'Funnel View',
    description: 'Display objects in funnel steps',
    getConfig: (params) => ({
      displayMode: 'table',
      density: 'comfortable',
      columns: [
        ...STANDARD_COLUMNS.map((col, index) => ({
          field: col.field,
          width: col.width,
          visible: col.defaultVisible,
          order: index,
          formatType: col.formatType,
        })),
        {
          field: 'step',
          width: 150,
          visible: true,
          order: STANDARD_COLUMNS.length,
        },
        {
          field: 'sub_status',
          width: 120,
          visible: true,
          order: STANDARD_COLUMNS.length + 1,
        },
      ],
    }),
    allowCustomization: true,
    defaultColumns: [
      ...STANDARD_COLUMNS.map((col, index) => ({
        field: col.field,
        width: col.width,
        visible: col.defaultVisible,
        order: index,
        formatType: col.formatType,
      })),
      {
        field: 'step',
        width: 150,
        visible: true,
        order: STANDARD_COLUMNS.length,
      },
      {
        field: 'sub_status',
        width: 120,
        visible: true,
        order: STANDARD_COLUMNS.length + 1,
      },
    ],
    restrictedColumns: ['step', 'sub_status'],
    requiredColumns: ['name', 'step'],
  },

  objectTypeView: {
    id: 'object-type-view',
    name: 'Object Type View',
    description: 'Display objects of specific type',
    getConfig: (params) => ({
      displayMode: 'table',
      density: 'comfortable',
      columns: STANDARD_COLUMNS.map((col, index) => ({
        field: col.field,
        width: col.width,
        visible: col.defaultVisible,
        order: index,
        formatType: col.formatType,
      })),
    }),
    allowCustomization: true,
    defaultColumns: STANDARD_COLUMNS.map((col, index) => ({
      field: col.field,
      width: col.width,
      visible: col.defaultVisible,
      order: index,
      formatType: col.formatType,
    })),
    requiredColumns: ['name'],
  },
};
