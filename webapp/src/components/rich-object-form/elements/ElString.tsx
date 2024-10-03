import React from 'react';
import { MasterFormElementProps } from '../ObjectType';
import { FormControl, FormLabel, Input, Text } from '@chakra-ui/react';

export const ElString: React.FC<MasterFormElementProps> = (
  props: MasterFormElementProps
) => {
  const { field, value, onChange, dataType } = props;
  return onChange ? (
    <FormControl key={field}>
      <FormLabel>{field}</FormLabel>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
      <Text fontSize='sm' color='gray.500'>
        {dataType}
      </Text>
    </FormControl>
  ) : (
    <Text>{value}</Text>
  );
};
