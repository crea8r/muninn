import { ObjectTypeElement, MasterFormElementProps } from './ObjectType';
import React from 'react';
import { ElString } from './elements/ElString';

const createDynamicComponent = (
  component: React.ComponentType<any>,
  props: any
) => {
  console.log('props:', props);
  return React.createElement(component, props);
};

export const MasterFormElement = ({
  field,
  dataType,
  value,
  onChange,
  style,
}: MasterFormElementProps) => {
  let ElementType = dataType;
  if (typeof dataType === 'string') {
  } else if (typeof dataType === 'object') {
    ElementType = dataType.type;
  }
  const Elm = ObjectTypeElement[ElementType] || ElString; // fallback to string if this field is deleted
  const dynamicElm = createDynamicComponent(Elm, {
    field,
    value,
    onChange,
    dataType,
    style,
  });
  return <>{dynamicElm}</>;
};
