// types/criteria.ts
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
