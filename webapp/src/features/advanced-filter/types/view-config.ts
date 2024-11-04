// types/view-config.ts
export type DisplayMode = 'table' | 'kanban';
export type DisplayDensity = 'compact' | 'comfortable';
export type ColumnFormatType =
  | 'text'
  | 'date'
  | 'number'
  | 'boolean'
  | 'object'
  | 'react.element'
  | 'md';

export interface ColumnConfig {
  field: string;
  label?: string;
  width?: number;
  visible: boolean;
  order: number;
  // For object type fields
  objectTypeId?: string;
  formatType?: ColumnFormatType;
  customFormat?: string; // For dates or numbers
  sortable?: boolean;
}

export interface ViewConfigBase {
  displayMode: DisplayMode;
  density: DisplayDensity;
  columns: ColumnConfig[];
}

export type ViewConfigSource =
  | { type: 'predefined'; id: string; params?: Record<string, any> }
  | { type: 'list'; listId: string; creatorListId?: string }
  | { type: 'temporary' };

export interface PredefinedViewConfig {
  id: string;
  name: string;
  description?: string;
  getConfig: (params?: Record<string, any>) => ViewConfigBase;
  allowCustomization: boolean;
  defaultColumns: ColumnConfig[];
  restrictedColumns?: string[];
  requiredColumns?: string[];
}
