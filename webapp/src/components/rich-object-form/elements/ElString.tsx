import React from 'react';
import { MasterFormElementProps } from '../ObjectType';
import { Flex, FormControl, FormLabel, Input, Text } from '@chakra-ui/react';

export const ElString: React.FC<MasterFormElementProps> = (
  props: MasterFormElementProps
) => {
  const { field, value, onChange, dataType, style } = props;
  return onChange ? (
    <FormControl key={field} style={style || {}}>
      <FormLabel>{field}</FormLabel>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
      <Text fontSize='sm' color='gray.500'>
        {dataType}
      </Text>
    </FormControl>
  ) : (
    <Flex direction='column'>
      <Text fontSize='sm' color='gray.500'>
        {field}
      </Text>
      <Text style={style || {}}>{value}</Text>
    </Flex>
  );
};
