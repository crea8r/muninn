import { Tag } from './Tag';

export interface Object {
  id: any;
  name: string;
  description: string;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
  typeValues: ObjectTypeValue[];
}

export interface ObjectDetail {
  id: any;
  name: string;
  description: string;
  idString: string;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
  types: ObjectType[];
  typeValues: ObjectTypeValue[];
}

export interface ObjectType {
  id: any;
  name: string;
  description?: string;
  fields: { [key: string]: any };
}

export interface ObjectTypeValue {
  id: any;
  objectTypeId: any;
  values: { [key: string]: any };
}
