// steps/MergePreviewStep.tsx
import React, { useMemo } from 'react';
import {
  VStack,
  HStack,
  Text,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Tag,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tooltip,
  Divider,
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import { Object, ObjectTypeValue } from 'src/types';

interface MergePreviewStepProps {
  sourceObject: Object;
  targetObject: Object;
  mergeRules: {
    nameSource: 'source' | 'target' | 'custom';
    descriptionSource: 'source' | 'target' | 'custom';
    customName: string;
    customDescription: string;
    typeValueRules: Record<string, 'source' | 'target'>;
  };
}

const MergePreviewStep: React.FC<MergePreviewStepProps> = ({
  sourceObject,
  targetObject,
  mergeRules,
}) => {
  // Calculate final values based on merge rules
  const getFinalName = () => {
    switch (mergeRules.nameSource) {
      case 'source':
        return sourceObject.name;
      case 'target':
        return targetObject.name;
      case 'custom':
        return mergeRules.customName || targetObject.name;
    }
  };

  const getFinalDescription = () => {
    switch (mergeRules.descriptionSource) {
      case 'source':
        return sourceObject.description;
      case 'target':
        return targetObject.description;
      case 'custom':
        return mergeRules.customDescription || targetObject.description;
    }
  };

  // Calculate final type values and their sources based on rules
  const { finalTypeValues, typeValueSources } = useMemo(() => {
    const values = new Map<string, ObjectTypeValue>();
    const sources = new Map<string, string>();

    window.Object.entries(mergeRules.typeValueRules).forEach(
      ([typeId, source]) => {
        const obj = source === 'source' ? sourceObject : targetObject;
        const typeValue = obj.typeValues.find(
          (tv) => tv.objectTypeId === typeId
        );

        if (typeValue) {
          values.set(typeId, typeValue);
          sources.set(typeId, source);
        }
      }
    );

    return {
      finalTypeValues: Array.from(values.values()),
      typeValueSources: sources,
    };
  }, [mergeRules.typeValueRules, sourceObject, targetObject]);

  // Calculate merged tags
  const mergedTags = useMemo(() => {
    const tagMap = new Map();
    [...targetObject.tags, ...sourceObject.tags].forEach((tag) => {
      tagMap.set(tag.id, tag);
    });
    return Array.from(tagMap.values());
  }, [sourceObject.tags, targetObject.tags]);

  return (
    <VStack spacing={6} align='stretch'>
      {/* Basic Information Preview */}
      <Card>
        <CardHeader>
          <HStack>
            <Heading size='md'>Basic Information</Heading>
            <Tooltip label='Final basic information after merge'>
              <InfoIcon color='gray.500' />
            </Tooltip>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack align='stretch' spacing={4}>
            <Box>
              <Text fontWeight='semibold' mb={2}>
                Name
              </Text>
              <HStack>
                <Text>{getFinalName()}</Text>
                <Badge
                  colorScheme={
                    mergeRules.nameSource === 'custom'
                      ? 'purple'
                      : mergeRules.nameSource === 'source'
                      ? 'blue'
                      : 'green'
                  }
                >
                  {mergeRules.nameSource}
                </Badge>
              </HStack>
            </Box>
            <Box>
              <Text fontWeight='semibold' mb={2}>
                Description
              </Text>
              <HStack alignItems='flex-start'>
                <Text>{getFinalDescription()}</Text>
                <Badge
                  colorScheme={
                    mergeRules.descriptionSource === 'custom'
                      ? 'purple'
                      : mergeRules.descriptionSource === 'source'
                      ? 'blue'
                      : 'green'
                  }
                >
                  {mergeRules.descriptionSource}
                </Badge>
              </HStack>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Type Values Preview */}
      <Card>
        <CardHeader>
          <HStack>
            <Heading size='md'>Type Values</Heading>
            <Tooltip label='Final type values based on selected rules'>
              <InfoIcon color='gray.500' />
            </Tooltip>
          </HStack>
        </CardHeader>
        <CardBody>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>Type</Th>
                <Th>Values</Th>
                <Th>Source</Th>
              </Tr>
            </Thead>
            <Tbody>
              {finalTypeValues.map((typeValue) => (
                <Tr key={typeValue.objectTypeId}>
                  <Td fontWeight='medium'>{typeValue.objectTypeId}</Td>
                  <Td>
                    <Accordion allowMultiple>
                      <AccordionItem border='none'>
                        <AccordionButton p={1} color='blue.500'>
                          <Text fontSize='sm'>View Values</Text>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          {window.Object.entries(typeValue.type_values).map(
                            ([key, value]) => (
                              <Text key={key} fontSize='sm'>
                                <strong>{key}:</strong> {value}
                              </Text>
                            )
                          )}
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={
                        typeValueSources.get(typeValue.objectTypeId) ===
                        'target'
                          ? 'green'
                          : 'blue'
                      }
                    >
                      {typeValueSources.get(typeValue.objectTypeId)}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Tags Preview */}
      <Card>
        <CardHeader>
          <HStack>
            <Heading size='md'>Tags</Heading>
            <Tooltip label='Combined unique tags from both objects'>
              <InfoIcon color='gray.500' />
            </Tooltip>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack align='stretch' spacing={4}>
            <HStack spacing={2} flexWrap='wrap'>
              {mergedTags.map((tag) => (
                <Tag
                  key={tag.id}
                  size='md'
                  backgroundColor={tag.color_schema.background}
                  color={tag.color_schema.text}
                >
                  {tag.name}
                </Tag>
              ))}
            </HStack>
            <Text fontSize='sm' color='gray.600'>
              Total: {mergedTags.length} tags
            </Text>
          </VStack>
        </CardBody>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <Heading size='md'>Merge Summary</Heading>
        </CardHeader>
        <CardBody>
          <VStack align='stretch' spacing={4}>
            <Box>
              <Text fontWeight='semibold' color='blue.600'>
                Changes Overview
              </Text>
              <Divider my={2} />
              <VStack align='stretch' spacing={2}>
                <Text>
                  • Basic Information: Using {mergeRules.nameSource} name and{' '}
                  {mergeRules.descriptionSource} description
                </Text>
                <Text>
                  • Type Values: {finalTypeValues.length} types configured
                </Text>
                <Text>• Tags: {mergedTags.length} unique tags combined</Text>
              </VStack>
            </Box>

            <Box>
              <Text fontWeight='semibold' color='orange.600'>
                Important Notes
              </Text>
              <Divider my={2} />
              <VStack align='stretch' spacing={2}>
                <Text>• The source object will be archived after merge</Text>
                <Text>• This action cannot be undone</Text>
                <Text>
                  • All relationships (tasks, facts, etc.) will be transferred
                  to the merged object
                </Text>
              </VStack>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default MergePreviewStep;
