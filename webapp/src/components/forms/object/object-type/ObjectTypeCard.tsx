// ObjectTypeCard.tsx
import React, { useMemo } from 'react';
import { Box, Flex, Heading, Spacer, Text, VStack } from '@chakra-ui/react';
import { ObjectType, ObjectTypeValue } from 'src/types/';
import FaIconList from 'src/components/FaIconList';
import { IconType } from 'react-icons';
import { capitalize } from 'lodash';
import { SmartObjectTypeValue } from 'src/features/smart-object-type';
import { SmartObjectFormConfig } from 'src/features/smart-object-type/type';

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
  const DefaultIcon = FaIconList['question'];
  const FaIcon = objectType?.icon ? FaIconList[objectType.icon] : DefaultIcon;
  return (
    <>
      <Box
        borderWidth={1}
        borderRadius='md'
        p={4}
        onClick={() => onOpen(objectType as ObjectType, objectTypeValue)}
        cursor='pointer'
        maxHeight={'200px'}
        overflowY={'scroll'}
      >
        <Heading size='sm' display={'flex'} alignItems={'center'} mb={4}>
          {FaIcon}
          <Text ml={1}>{capitalize(objectType?.name) || 'Unknown Type'}</Text>
        </Heading>
        <SimpleObjectTypeView
          config={objectType as SmartObjectFormConfig}
          values={objectTypeValue.type_values}
        />
      </Box>
    </>
  );
};

interface SimpleObjectTypeViewProps {
  config: SmartObjectFormConfig;
  values: { [key: string]: any };
}

const SimpleObjectTypeView = ({
  config,
  values,
}: SimpleObjectTypeViewProps) => {
  const sortedFields = useMemo(() => {
    return Object.entries(config.fields).sort(
      ([, a], [, b]) => (a.meta?.order ?? 0) - (b.meta?.order ?? 0)
    );
  }, [config]);
  const DefaultIcon = FaIconList['question'];
  return (
    <VStack spacing={2} align='stretch' width={'100%'}>
      {sortedFields.map(([field, fieldConfig]) => {
        // skip images for now
        if (fieldConfig.type === 'image') return null;
        return (
          values[field] && (
            <Flex key={field} overflowX={'hidden'}>
              <Flex alignItems={'center'}>
                {FaIconList[fieldConfig.meta?.icon as keyof IconType] ||
                  DefaultIcon}
                <Text ml={1}>{capitalize(field)}</Text>
              </Flex>
              <Spacer />
              <Box maxWidth={'60%'} overflow={'hidden'} maxHeight={'200px'}>
                <SmartObjectTypeValue
                  field={field}
                  value={values[field]}
                  config={fieldConfig}
                />
              </Box>
            </Flex>
          )
        );
      })}
    </VStack>
  );
};

export default ObjectTypeCard;
