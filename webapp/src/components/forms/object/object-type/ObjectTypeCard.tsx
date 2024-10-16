// ObjectTypeCard.tsx
import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import { ObjectType, ObjectTypeValue } from 'src/types/';
import FaIconList from 'src/components/FaIconList';
import { IconType } from 'react-icons';

interface ObjectTypeCardProps {
  objectType: ObjectType | undefined;
  objectTypeValue: ObjectTypeValue;
  onOpen: (objectType: ObjectType, objectTypeValue: ObjectTypeValue) => void;
}

const ObjectTypeCard = ({
  objectTypeValue,
  objectType,
  onOpen,
}: ObjectTypeCardProps) => {
  const cardContent = Object.entries(objectTypeValue.type_values)
    .filter(
      ([, value]) =>
        value !== null &&
        value !== undefined &&
        value !== '' &&
        !value.includes('http')
    )
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')
    .slice(0, 200);

  return (
    <>
      <Box
        borderWidth={1}
        borderRadius='md'
        p={4}
        onClick={() => onOpen(objectType as ObjectType, objectTypeValue)}
        cursor='pointer'
      >
        <Heading size='sm' display={'flex'} alignItems={'center'}>
          {FaIconList[objectType?.icon as keyof IconType]}{' '}
          <Text ml={1}>{objectType?.name || 'Unknown Type'}</Text>
        </Heading>
        <Text noOfLines={3}>{cardContent}</Text>
      </Box>
    </>
  );
};

export default ObjectTypeCard;
