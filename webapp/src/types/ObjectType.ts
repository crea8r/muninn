export interface ObjectType {
  id: any;
  name: string;
  fields: { [key: string]: any };
}

export interface ObjectTypeValue {
  objectTypeId: any;
  values: { [key: string]: any };
}
