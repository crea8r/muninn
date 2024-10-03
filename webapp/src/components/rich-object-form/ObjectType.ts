import { ElString } from './elements/ElString';
import { ElDateTime } from './elements/ElDateTime';
import { image } from '@uiw/react-md-editor';
import { ElImage } from './elements/ElImage';
// obj_type_value.type_values: key -> value
// obj_type.fields: field name -> field type and its configuration
// e.g:{
const example = {
  id: 'some_uuid',
  description: 'A person',
  name: 'Person',
  fields: {
    name: 'string',
    age: { type: 'datetime', min: '1990' },
    email: 'email',
    interest: {
      type: 'multiple_choice',
      max_choice: 3,
      options: ['music', 'movie', 'book', 'sport'],
    },
  },
};

// TODO: each field type has its own custom render UI
export const ObjectTypeElement: any = {
  string: ElString,
  number: ElString,
  percent: ElString,
  url: ElString,
  long_text: ElString,
  phone: ElString,
  email: ElString,
  datetime: ElString,
  image: ElImage,
};

export type MasterFormElementProps = {
  field: string;
  dataType: any;
  value: string;
  onChange?: (value: any) => void;
};

// datetime: {
//   type: 'datetime',
//   fields: ['min', 'max'],
// },
// object_id: {
//   type: 'object_id',
//   fields: ['include_object_type_ids', 'exclude_object_type_ids'],
// },
// single_choice: { type: 'single_choice', fields: ['options'] },
// multiple_choice: {
//   type: 'multiple_choice',
//   fields: ['max_choice', 'options'],
// },
// unit: seconds, minutes, hours, days, weeks, months, years
// duration: { type: 'duration', fields: ['unit'] },
