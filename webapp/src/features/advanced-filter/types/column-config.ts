import { ColumnFormatType } from './view-config';

// types/column-config.ts
export interface StandardColumn {
  field: string;
  label: string;
  width: number;
  sortable: boolean;
  defaultVisible: boolean;
  required?: boolean;
  formatType?: ColumnFormatType;
}

export interface TypeValueColumn extends Omit<StandardColumn, 'field'> {
  objectTypeId: string;
  field: string;
  typeFieldKey: string;
}
