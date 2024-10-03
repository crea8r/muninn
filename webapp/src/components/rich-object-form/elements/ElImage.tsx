import React from 'react';
import { MasterFormElementProps } from '../ObjectType';
import { FormControl, FormLabel, Input, Text } from '@chakra-ui/react';
import NoImage from 'src/assets/NoImage.jpg';

export const ElImage: React.FC<MasterFormElementProps> = (
  props: MasterFormElementProps
) => {
  const { field, value, onChange, dataType } = props;
  return onChange ? (
    <FormControl key={field}>
      <FormLabel>{field}</FormLabel>
      <img
        src={value || NoImage}
        alt={field}
        style={{
          maxHeight: '512px',
          width: '100%',
        }}
      />
      <Input mt={1} value={value} onChange={(e) => onChange(e.target.value)} />
      <Text fontSize='sm' color='gray.500'>
        {dataType}
      </Text>
    </FormControl>
  ) : (
    <img
      src={value || NoImage}
      alt={field}
      style={{
        maxHeight: '512px',
        width: '100%',
      }}
    />
  );
};
