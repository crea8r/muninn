export interface KeyMetaNumberType {
  type: 'number';
  validation?: {
    required?: boolean;
    range?: { min: number; max: number };
  };
}

export interface KeyMetaDateType {
  type: 'date';
  validation?: {
    required?: boolean;
    range?: { min: string; max: string };
  };
}

export interface KeyMetaStringType {
  type: 'string';
  validation?: {
    required?: boolean;
    regex?: string;
    dropdown?: {
      multiple?: boolean;
      values: string[];
    };
  };
}

export interface KeyMetaObjectType {
  type: 'object';
  validation?: {
    required?: boolean;
    tagIds?: string[];
    objectTypeIds?: string[];
    funnels?: {
      ids: string[];
      subStatus: number;
    };
  };
}

export interface KeyMetaType {
  order: number;
  description?: string;
  icon?: string;
  type?:
    | KeyMetaNumberType
    | KeyMetaDateType
    | KeyMetaStringType
    | KeyMetaObjectType;
}
