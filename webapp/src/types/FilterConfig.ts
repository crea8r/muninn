export interface FilterConfig {
  search?: string;
  tagIds?: string[];
  typeIds?: string[];
  typeValueCriteria?: TypeValueFilter;
  funnelStepFilter?: FunnelStepFilter;
  sortBy?: string;
  ascending?: boolean;
  type_value_field?: string; // Added for type value sorting
  page: number;
  pageSize: number;
}

export interface TypeValueCriteria {
  objectTypeId: string;
  field: string;
  value: string;
}

export interface TypeValueFilter {
  criteria1?: Record<string, string>;
  criteria2?: Record<string, string>;
  criteria3?: Record<string, string>;
}
export interface FilterOptions {
  allowedTypes?: string[];
  allowedTags?: string[];
}

export interface FunnelStepFilter {
  funnelId: string | null;
  stepIds: string[];
  subStatuses: number[];
}
