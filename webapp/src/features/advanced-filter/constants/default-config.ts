// constants/default-config.ts
import { FilterConfig } from '../types/filters';
import { ViewConfigBase } from '../types/view-config';
import { STANDARD_COLUMNS } from './default-columns';

export const DEFAULT_FILTER_CONFIG: Omit<FilterConfig, 'search' | 'page'> = {
  pageSize: 20, // Will be overridden by globalData.perPage
  sortBy: 'created_at',
  ascending: false,
  // Add any other default filter settings
};

export const DEFAULT_VIEW_CONFIG: ViewConfigBase = {
  displayMode: 'table',
  density: 'comfortable',
  columns: STANDARD_COLUMNS.map((col, index) => ({
    field: col.field,
    label: col.label,
    width: col.width,
    visible: col.defaultVisible,
    order: col.order,
    formatType: col.formatType,
    sortable: col.sortable,
  })),
};
