// steps/MergeRuleStep.tsx
import React, { useMemo } from 'react';
import {
  VStack,
  HStack,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
  Badge,
  Select,
  Tag,
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@chakra-ui/react';
import { InfoIcon, ChevronDownIcon, EditIcon } from '@chakra-ui/icons';
import { Object, ObjectType } from 'src/types';
import { useGlobalContext } from 'src/contexts/GlobalContext';

interface ValueOption {
  source: 'source' | 'target' | 'custom';
  value: string;
  label: string;
}

interface MergeRuleStepProps {
  sourceObject: Object;
  targetObject: Object;
  rules: {
    nameSource: 'source' | 'target' | 'custom';
    descriptionSource: 'source' | 'target' | 'custom';
    customName: string;
    customDescription: string;
    typeValueRules: Record<string, 'source' | 'target'>;
  };
  onRulesChange: (rules: any) => void;
}

const EditableSelect: React.FC<{
  options: ValueOption[];
  value: string;
  onChange: (value: string, source: 'source' | 'target' | 'custom') => void;
  onCustomChange: (value: string) => void;
  customValue: string;
  label: string;
  isMultiline?: boolean;
}> = ({
  options,
  value,
  onChange,
  onCustomChange,
  customValue,
  label,
  isMultiline,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const selectedOption = options.find(
    (opt) =>
      opt.source ===
      (value === customValue
        ? 'custom'
        : value === options[0].value
        ? 'target'
        : 'source')
  );

  return (
    <>
      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          width='full'
          textAlign='left'
        >
          <Text noOfLines={1}>
            {selectedOption ? selectedOption.label : 'Select value'}
          </Text>
        </MenuButton>
        <MenuList>
          {options.map((option) => (
            <MenuItem
              key={option.source}
              onClick={() => {
                if (option.source === 'custom') {
                  onOpen();
                } else {
                  onChange(option.value, option.source);
                }
              }}
            >
              <HStack>
                <Text>{option.label}</Text>
                {option.source === 'custom' && <EditIcon />}
              </HStack>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit {label}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isMultiline ? (
              <Textarea
                value={customValue}
                onChange={(e) => onCustomChange(e.target.value)}
                rows={5}
              />
            ) : (
              <Input
                value={customValue}
                onChange={(e) => onCustomChange(e.target.value)}
              />
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme='blue'
              onClick={() => {
                onChange(customValue, 'custom');
                onClose();
              }}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

const MergeRuleStep: React.FC<MergeRuleStepProps> = ({
  sourceObject,
  targetObject,
  rules,
  onRulesChange,
}) => {
  // const { objectTypes, isLoading: isLoadingTypes } = useObjectTypes();
  const { globalData } = useGlobalContext();

  const updateRules = (key: string, value: any) => {
    onRulesChange({ ...rules, [key]: value });
  };

  const updateTypeValueRule = (typeId: string, source: 'source' | 'target') => {
    onRulesChange({
      ...rules,
      typeValueRules: {
        ...rules.typeValueRules,
        [typeId]: source,
      },
    });
  };

  // Get all unique object types from both objects
  const allTypeIds = useMemo(() => {
    const typeIds = new Set<string>();
    sourceObject.typeValues.forEach((tv) => typeIds.add(tv.objectTypeId));
    targetObject.typeValues.forEach((tv) => typeIds.add(tv.objectTypeId));
    return Array.from(typeIds);
  }, [sourceObject, targetObject]);

  // Calculate merged tags
  const mergedTags = useMemo(() => {
    const tagMap = new Map();
    [...targetObject.tags, ...sourceObject.tags].forEach((tag) => {
      tagMap.set(tag.id, tag);
    });
    return Array.from(tagMap.values());
  }, [sourceObject.tags, targetObject.tags]);

  const nameOptions: ValueOption[] = [
    {
      source: 'target',
      value: targetObject.name,
      label: `Target: ${targetObject.name}`,
    },
    {
      source: 'source',
      value: sourceObject.name,
      label: `Source: ${sourceObject.name}`,
    },
    { source: 'custom', value: rules.customName, label: 'Custom Value' },
  ];

  const descriptionOptions: ValueOption[] = [
    {
      source: 'target',
      value: targetObject.description,
      label: 'Target Description',
    },
    {
      source: 'source',
      value: sourceObject.description,
      label: 'Source Description',
    },
    {
      source: 'custom',
      value: rules.customDescription,
      label: 'Custom Description',
    },
  ];

  return (
    <VStack spacing={6} align='stretch'>
      {/* Basic Information Rules */}
      <Card>
        <CardHeader>
          <Heading size='md'>Basic Information Rules</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align='stretch'>
            <FormControl>
              <FormLabel>
                <HStack>
                  <Text>Name</Text>
                  <Tooltip label='Choose which name to use in the merged object'>
                    <InfoIcon color='gray.500' />
                  </Tooltip>
                </HStack>
              </FormLabel>
              <EditableSelect
                options={nameOptions}
                value={
                  rules.nameSource === 'custom'
                    ? rules.customName
                    : rules.nameSource === 'target'
                    ? targetObject.name
                    : sourceObject.name
                }
                onChange={(value, source) => {
                  updateRules('nameSource', source);
                  if (source === 'custom') {
                    updateRules('customName', value);
                  }
                }}
                onCustomChange={(value) => updateRules('customName', value)}
                customValue={rules.customName}
                label='Name'
              />
            </FormControl>

            <FormControl>
              <FormLabel>
                <HStack>
                  <Text>Description</Text>
                  <Tooltip label='Choose which description to use in the merged object'>
                    <InfoIcon color='gray.500' />
                  </Tooltip>
                </HStack>
              </FormLabel>
              <EditableSelect
                options={descriptionOptions}
                value={
                  rules.descriptionSource === 'custom'
                    ? rules.customDescription
                    : rules.descriptionSource === 'target'
                    ? targetObject.description
                    : sourceObject.description
                }
                onChange={(value, source) => {
                  updateRules('descriptionSource', source);
                  if (source === 'custom') {
                    updateRules('customDescription', value);
                  }
                }}
                onCustomChange={(value) =>
                  updateRules('customDescription', value)
                }
                customValue={rules.customDescription}
                label='Description'
                isMultiline
              />
            </FormControl>
          </VStack>
        </CardBody>
      </Card>

      {/* Type Values Rules */}
      <Card>
        <CardHeader>
          <HStack>
            <Heading size='md'>Type Values Rules</Heading>
            <Tooltip label="Choose which object's values to use for each type">
              <InfoIcon color='gray.500' />
            </Tooltip>
          </HStack>
        </CardHeader>
        <CardBody>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>Type</Th>
                <Th>Source Object Values</Th>
                <Th>Target Object Values</Th>
                <Th>Choose Source</Th>
              </Tr>
            </Thead>
            <Tbody>
              {allTypeIds.map((typeId) => {
                const sourceTypeValue = sourceObject.typeValues.find(
                  (tv) => tv.objectTypeId === typeId
                );
                const targetTypeValue = targetObject.typeValues.find(
                  (tv) => tv.objectTypeId === typeId
                );
                const typeName =
                  globalData?.objectTypeData?.objectTypes.find(
                    (t: ObjectType) => t.id === typeId
                  )?.name || `Unknown (${typeId})`;

                return (
                  <Tr key={typeId}>
                    <Td fontWeight='medium'>{typeName}</Td>
                    <Td>
                      {sourceTypeValue ? (
                        <Badge colorScheme='blue'>Available</Badge>
                      ) : (
                        <Badge colorScheme='gray'>Not Available</Badge>
                      )}
                    </Td>
                    <Td>
                      {targetTypeValue ? (
                        <Badge colorScheme='green'>Available</Badge>
                      ) : (
                        <Badge colorScheme='gray'>Not Available</Badge>
                      )}
                    </Td>
                    <Td>
                      <Select
                        value={rules.typeValueRules[typeId] || 'target'}
                        onChange={(e) =>
                          updateTypeValueRule(
                            typeId,
                            e.target.value as 'source' | 'target'
                          )
                        }
                      >
                        <option value='target' disabled={!targetTypeValue}>
                          Target
                        </option>
                        <option value='source' disabled={!sourceTypeValue}>
                          Source
                        </option>
                      </Select>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Tags Preview */}
      <Card>
        <CardHeader>
          <HStack>
            <Heading size='md'>Tags to be Merged</Heading>
            <Tooltip label='All unique tags from both objects will be included'>
              <InfoIcon color='gray.500' />
            </Tooltip>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack align='stretch' spacing={4}>
            <Box>
              <Text fontWeight='semibold' mb={2}>
                Source Object Tags:
              </Text>
              <HStack spacing={2} flexWrap='wrap'>
                {sourceObject.tags.map((tag) => (
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
            </Box>

            <Box>
              <Text fontWeight='semibold' mb={2}>
                Target Object Tags:
              </Text>
              <HStack spacing={2} flexWrap='wrap'>
                {targetObject.tags.map((tag) => (
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
            </Box>

            <Box>
              <Text fontWeight='semibold' mb={2}>
                Final Merged Tags:
              </Text>
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
            </Box>

            <Text fontSize='sm' color='gray.600'>
              Total: {mergedTags.length} unique tags will be included in the
              merged object
            </Text>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default MergeRuleStep;
