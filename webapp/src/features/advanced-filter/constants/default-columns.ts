// constants/default-columns.ts
import { StandardColumn } from '../types/column-config';

export const STANDARD_COLUMNS: StandardColumn[] = [
  {
    field: 'name',
    label: 'Name',
    width: 200,
    sortable: true,
    defaultVisible: true,
    required: true,
  },
  {
    field: 'created_at',
    label: 'Created Date',
    width: 150,
    sortable: true,
    defaultVisible: true,
    formatType: 'date',
  },
  {
    field: 'first_fact_date',
    label: 'First Fact',
    width: 150,
    sortable: true,
    defaultVisible: false,
    formatType: 'date',
  },
  {
    field: 'last_fact_date',
    label: 'Last Fact',
    width: 150,
    sortable: true,
    defaultVisible: false,
    formatType: 'date',
  },
  {
    field: 'id_string',
    label: 'ID String',
    width: 150,
    sortable: true,
    defaultVisible: false,
  },
  {
    field: 'tags',
    label: 'Tags',
    width: 150,
    sortable: true,
    defaultVisible: true,
    formatType: 'react.element',
  },
  {
    field: 'type_values',
    label: 'Type Values',
    width: 150,
    sortable: true,
    defaultVisible: false,
    formatType: 'react.element',
  },
];
