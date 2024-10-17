import React from 'react';
import { MasterFormElementProps } from '../ObjectType';
import { FormControl, FormLabel, Input, Text } from '@chakra-ui/react';
import SmartImage from 'src/components/SmartImage';

export const ElImage: React.FC<MasterFormElementProps> = (
  props: MasterFormElementProps
) => {
  const { field, value, onChange, dataType, style } = props;
  return onChange ? (
    <FormControl key={field}>
      <FormLabel>{field}</FormLabel>
      <SmartImage
        src={value}
        alt={field}
        style={{ maxHeight: '200px', maxWidth: '200px' }}
      />
      <Input mt={1} value={value} onChange={(e) => onChange(e.target.value)} />
      <Text fontSize='sm' color='gray.500'>
        {dataType}
      </Text>
    </FormControl>
  ) : (
    <SmartImage
      src={value}
      alt={field}
      style={{ maxHeight: '200px', maxWidth: '200px', ...style }}
    />
  );
};
