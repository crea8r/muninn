import { Tag } from './Tag';
import { Task } from './Task';

export interface Object {
  id: any;
  name: string;
  idString: string;
  description: string;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
  typeValues: ObjectTypeValue[];
  aliases: string[];
}

export interface ListObjectsRow {
  id: any;
  name: string;
  idString: string;
  description: string;
  aliases: string[];
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
  typeValues: ObjectTypeValue[];

  searchRank: number;
  matchSource: string;
  objHeadline: string;
  typeValueHeadline: string;
  factHeadline: string;
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
  aliases: string[];
  tags: Tag[];
  tasks: Task[];
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
  icon: string;
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
  searchOrder?: string;
  search?: string;
}
