// types/column-config.ts
export interface StandardColumn {
  field: string;
  label: string;
  width: number;
  sortable: boolean;
  defaultVisible: boolean;
  required?: boolean;
  formatType?: 'text' | 'date' | 'number' | 'boolean' | 'react.element';
}

export interface TypeValueColumn extends Omit<StandardColumn, 'field'> {
  objectTypeId: string;
  field: string;
  typeFieldKey: string;
}
