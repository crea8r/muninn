import { Tag } from './Tag';

export interface Object {
  id: any;
  name: string;
  idString: string;
  description: string;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
  typeValues: ObjectTypeValue[];
}

export type NewObject = Omit<
  Object,
  'id' | 'createdAt' | 'updatedAt' | 'tags' | 'typeValues'
>;

export type UpdateObject = Omit<
  Object,
  'createdAt' | 'updatedAt' | 'tags' | 'typeValues'
>;

export interface StepAndFunnel {
  id: string;
  stepId: string;
  stepName: string;
  funnelId: string;
  funnelName: string;
  deletedAt: any;
  createdAt: string;
  subStatus: number;
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
  stepsAndFunnels: StepAndFunnel[];
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
  type_values: { [key: string]: any };
}

export interface ObjectTypeFilter {
  keyValues: { [key: string]: string };
  tags: Tag[];
  objectTypeFields: { [key: string]: any };
  displayColumns?: string[];
}
