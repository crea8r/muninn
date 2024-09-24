import { FormControl, FormLabel, Input, Text } from '@chakra-ui/react';
import { ObjectTypeElement, MasterFormElementProps } from './ObjectType';
import React from 'react';

const createDynamicComponent = (
  component: React.ComponentType<any>,
  props: any
) => {
  return React.createElement(component, props);
};

export const MasterFormElement = ({
  field,
  dataType,
  value,
  onChange,
}: MasterFormElementProps) => {
  let ElementType = dataType;
  if (typeof dataType === 'string') {
  } else if (typeof dataType === 'object') {
    ElementType = dataType.type;
  }
  const Elm = ObjectTypeElement[ElementType];

  const dynamicElm = createDynamicComponent(Elm, {
    field,
    value,
    onChange,
    dataType,
  });
  return <>{dynamicElm}</>;
};
