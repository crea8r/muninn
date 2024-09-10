export interface Object {
  id: any;
  name: string;
  description: string;
  tags: { id: string; text: string }[];
  createdAt: string;
  updatedAt: string;
}
export interface ObjectType {
  id: any;
  name: string;
  description?: string;
  fields: { [key: string]: any };
}

export interface ObjectTypeValue {
  objectTypeId: any;
  values: { [key: string]: any };
}
