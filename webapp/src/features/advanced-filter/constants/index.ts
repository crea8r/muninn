export const STANDARD_SORT_OPTIONS = [
  { value: 'created_at', label: 'Created Date' },
  { value: 'fact_count', label: 'Fact Count' },
  { value: 'first_fact', label: 'First Fact Date' },
  { value: 'last_fact', label: 'Last Fact Date' },
  { value: 'name', label: 'Name' },
];

export type SortType = 'standard' | 'type_value';

export enum SubStatus {
  TO_ENGAGE = 0,
  PROCEEDING = 1,
  DROP_OUT = 2,
}

// export const MAX_CRITERIA = 3;
export const MAX_CRITERIA = 3;
