// components/table/MergeObjectsDialog.tsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Radio,
  RadioGroup,
  Text,
  Box,
  FormControl,
  FormLabel,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Checkbox,
  Tag,
  TagCloseButton,
} from '@chakra-ui/react';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import { shortenText } from 'src/utils';
import { Object as MuninnObject, ObjectTypeValue } from 'src/types';
import { mergeObjects, MergeObjectsPayload } from 'src/api/object';
import { useHistory } from 'react-router-dom';
import { capitalize } from 'lodash';

interface MergeObjectsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedObjects: any[];
  onSuccess?: () => void;
}

type FieldSelection = {
  sourceObjectId: string;
  combine: boolean;
};

interface MergeConfig {
  name: string;
  description: string;
  id_string: string;
  typeValues: Record<string, Record<string, FieldSelection>>;
  aliases: string[];
}

const combineAllObjectTypes = (selectedObjects, globalData) => {
  const typeFrequency: Record<
    string,
    {
      count: number;
      fields: Set<string>;
      typeName?: string;
    }
  > = {};
  const allObjTypeValues = [];
  selectedObjects.forEach((obj) => {
    obj.type_values?.forEach((tv: ObjectTypeValue) => {
      if (!typeFrequency[tv.objectTypeId]) {
        allObjTypeValues.push(tv);
        const objectType = globalData?.objectTypeData?.objectTypes.find(
          (t) => t.id === tv.objectTypeId
        );
        typeFrequency[tv.objectTypeId] = {
          count: 1,
          fields: new Set(window.Object.keys(tv.type_values)),
          typeName: objectType?.name,
        };
      } else {
        typeFrequency[tv.objectTypeId].count++;
        window.Object.keys(tv.type_values).forEach((field) =>
          typeFrequency[tv.objectTypeId].fields.add(field)
        );
      }
    });
  });
  return {
    typeFrequency,
    allObjTypeValues,
  };
};

export const MergeObjectsDialog: React.FC<MergeObjectsDialogProps> = ({
  isOpen,
  onClose,
  selectedObjects,
  onSuccess,
}) => {
  const toast = useToast();
  const history = useHistory();
  const [isDirty, setIsDirty] = useState(false);
  const { globalData } = useGlobalContext();
  const overlappingTypes = useMemo(() => {
    const { typeFrequency } = combineAllObjectTypes(
      selectedObjects,
      globalData
    );

    // Only return types that appear in multiple objects
    return window.Object.entries(typeFrequency)
      .filter(([_, data]) => data.count > 1)
      .map(([typeId, data]) => ({
        typeId,
        typeName: data.typeName || 'Unknown Type',
        fields: Array.from(data.fields),
      }));
  }, [selectedObjects, globalData]);
  const initMergeConfig = useMemo(() => {
    const aliases = (selectedObjects as MuninnObject[])
      .map((obj) => obj.aliases || [])
      .flat();
    const firstObject = selectedObjects[0];
    return {
      name: firstObject?.id,
      description: firstObject?.id,
      id_string: firstObject?.id,
      typeValues: overlappingTypes.reduce((acc, type) => {
        acc[type.typeId] = type.fields.reduce((acc, field) => {
          acc[field] = {
            sourceObjectId: firstObject.id,
            combine: false,
          };
          return acc;
        }, {});
        return acc;
      }, {}),
      aliases,
    };
  }, [selectedObjects, overlappingTypes]);
  const [mergeConfig, setMergeConfig] = useState<MergeConfig>(() => {
    return initMergeConfig;
  });
  useEffect(() => {
    setMergeConfig(initMergeConfig);
  }, [initMergeConfig]);
  // Get overlapping object types and their fields

  const handleBasicFieldChange =
    (field: keyof Pick<MergeConfig, 'name' | 'description' | 'id_string'>) =>
    (value: string) => {
      setIsDirty(true);
      if (field === 'id_string') {
        let currentAliases = initMergeConfig.aliases || [];
        let newAliases = selectedObjects.map((obj) => obj.id_string);
        // merge two array and remove duplicates
        const selectedIdString = selectedObjects.find(
          (obj) => obj.id === value
        ).id_string;
        let aliases = Array.from(
          new Set([...currentAliases, ...newAliases])
        ).filter((id) => id !== selectedIdString);
        setMergeConfig({ ...mergeConfig, [field]: value, aliases });
      } else {
        setMergeConfig({ ...mergeConfig, [field]: value });
      }
    };

  const handleTypeFieldChange =
    (typeId: string, field: string) => (selection: FieldSelection) => {
      setIsDirty(true);
      setMergeConfig((prev) => ({
        ...prev,
        typeValues: {
          ...prev.typeValues,
          [typeId]: {
            ...prev.typeValues[typeId],
            [field]: selection,
          },
        },
      }));
    };

  const handleMerge = async () => {
    try {
      // Validation
      if (
        !mergeConfig.name ||
        !mergeConfig.description ||
        !mergeConfig.id_string
      ) {
        throw new Error('Please select values for all basic fields');
      }

      // Build merged object
      const mergedObject = {
        name: selectedObjects.find((obj) => obj.id === mergeConfig.name)?.name,
        description: selectedObjects.find(
          (obj) => obj.id === mergeConfig.description
        )?.description,
        id_string: selectedObjects.find(
          (obj) => obj.id === mergeConfig.id_string
        )?.id_string,
        type_values: {} as Record<string, any>,
        aliases: mergeConfig.aliases,
      };

      // Merge type values
      Object.entries(mergeConfig.typeValues).forEach(([typeId, fields]) => {
        mergedObject.type_values[typeId] = {};
        Object.entries(fields).forEach(([field, selection]) => {
          if (selection.combine) {
            // Combine values from all objects that have this field
            const values = selectedObjects
              .map(
                (obj) =>
                  obj.type_values?.find((tv: any) => tv.objectTypeId === typeId)
                    ?.type_values[field]
              )
              .filter(Boolean);
            mergedObject.type_values[typeId][field] = values.join(', ');
          } else {
            // Take value from selected object
            const sourceObject = selectedObjects.find(
              (obj) => obj.id === selection.sourceObjectId
            );
            mergedObject.type_values[typeId][field] =
              sourceObject?.type_values?.find(
                (tv: any) => tv.objectTypeId === typeId
              )?.type_values[field];
          }
        });
      });

      const { allObjTypeValues, typeFrequency } = combineAllObjectTypes(
        selectedObjects,
        globalData
      );
      // filter out the type values that appear in only one object
      const nonOverlapTypeValues = {};
      allObjTypeValues
        .filter((tv) => typeFrequency[tv.objectTypeId].count === 1)
        .forEach((tv) => {
          nonOverlapTypeValues[tv.objectTypeId] = tv.type_values;
        });
      mergedObject.type_values = {
        ...mergedObject.type_values,
        ...nonOverlapTypeValues,
      };
      const targetObjectId = selectedObjects.find(
        (obj) => obj.id_string === mergedObject.id_string
      )?.id;
      const sourceObjectIds = selectedObjects
        .filter((obj) => obj.id !== targetObjectId)
        .map((obj) => obj.id);
      const payload: MergeObjectsPayload = {
        target_object_id: targetObjectId,
        source_object_ids: sourceObjectIds,
        type_values: Object.entries(mergedObject.type_values).map(
          ([typeId, typeValues]) => ({
            typeId,
            typeValues,
          })
        ),
        name: mergedObject.name,
        description: mergedObject.description,
        id_string: mergedObject.id_string,
        aliases: mergedObject.aliases,
      };
      console.log('payload', payload);
      await mergeObjects(payload);
      toast({
        title: 'Objects merged successfully',
        status: 'success',
        duration: 3000,
      });
      onSuccess?.();
      setIsDirty(false);
      onClose();
      history.push(`/objects/${targetObjectId}`);
    } catch (error) {
      toast({
        title: 'Error merging objects',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const renderObjectValue = (field: string, objectId: string) => {
    const object = selectedObjects.find((obj) => obj.id === objectId);
    switch (field) {
      case 'name':
      case 'description':
        return shortenText(object?.[field], 50);
      case 'id_string':
        return object?.[field];
      default:
        return 'Unknown field';
    }
  };

  const renderTypeFieldValue = (
    typeId: string,
    field: string,
    objectId: string
  ) => {
    const object = selectedObjects.find((obj) => obj.id === objectId);
    return object?.type_values?.find((tv: any) => tv.objectTypeId === typeId)
      ?.type_values[field];
  };

  const handleReset = () => {
    setMergeConfig({
      name: selectedObjects[0]?.id,
      description: selectedObjects[0]?.id,
      id_string: selectedObjects[0]?.id,
      typeValues: {},
      aliases: (selectedObjects as MuninnObject[])
        .map((obj) => obj.aliases)
        .flat(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (isDirty) {
          if (
            window.confirm(
              'You have unsaved changes. Are you sure you want to close?'
            )
          ) {
            handleReset();
            onClose();
          }
        } else {
          onClose();
        }
      }}
      size='xl'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Merge {selectedObjects.length} Objects</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align='stretch'>
            <Text fontWeight='bold' color='red.500'>
              Choose the values to merge:
            </Text>
            <>
              <Accordion allowToggle defaultIndex={0}>
                <AccordionItem key={'basic_fields'}>
                  <AccordionButton>
                    <Box flex='1' textAlign='left'>
                      <Text fontWeight='bold'>Basic Fields</Text>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel>
                    {(['name', 'description', 'id_string'] as const).map(
                      (field) => (
                        <FormControl key={field} mt={2}>
                          <FormLabel textTransform={'capitalize'}>
                            {field}
                          </FormLabel>
                          <RadioGroup
                            onChange={handleBasicFieldChange(field)}
                            value={mergeConfig[field]}
                          >
                            <VStack align='start'>
                              {selectedObjects.map((obj) => (
                                <Radio key={obj.id} value={obj.id}>
                                  {renderObjectValue(field, obj.id)}
                                </Radio>
                              ))}
                            </VStack>
                          </RadioGroup>
                        </FormControl>
                      )
                    )}
                    {mergeConfig.aliases.length > 0 && (
                      <FormControl mt={2}>
                        <FormLabel>Aliases</FormLabel>
                        <VStack align='start'>
                          {mergeConfig.aliases.map((alias, index) => (
                            <Tag
                              textTransform={'none'}
                              background={'blue.100'}
                              key={index}
                            >
                              {alias}
                              <TagCloseButton
                                onClick={() => {
                                  const aliases = mergeConfig.aliases.filter(
                                    (a) => a !== alias
                                  );
                                  setMergeConfig({ ...mergeConfig, aliases });
                                }}
                              />
                            </Tag>
                          ))}
                        </VStack>
                      </FormControl>
                    )}
                  </AccordionPanel>
                </AccordionItem>
                {overlappingTypes?.length &&
                  overlappingTypes.map((type) => (
                    <AccordionItem key={type.typeId}>
                      <AccordionButton>
                        <Box flex='1' textAlign='left'>
                          <Text fontWeight='bold'>
                            {capitalize(type.typeName)}
                          </Text>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel>
                        <VStack align='stretch' spacing={4}>
                          {type.fields.map((field) => (
                            <Box key={field}>
                              <FormControl>
                                <FormLabel>{field}</FormLabel>
                                <Checkbox
                                  mb={2}
                                  isChecked={
                                    mergeConfig.typeValues[type.typeId]?.[field]
                                      ?.combine
                                  }
                                  onChange={(e) =>
                                    handleTypeFieldChange(
                                      type.typeId,
                                      field
                                    )({
                                      sourceObjectId: selectedObjects[0].id,
                                      combine: e.target.checked,
                                    })
                                  }
                                >
                                  Combine values
                                </Checkbox>
                                {!mergeConfig.typeValues[type.typeId]?.[field]
                                  ?.combine && (
                                  <RadioGroup
                                    onChange={(value) =>
                                      handleTypeFieldChange(
                                        type.typeId,
                                        field
                                      )({
                                        sourceObjectId: value,
                                        combine: false,
                                      })
                                    }
                                    value={
                                      mergeConfig.typeValues[type.typeId]?.[
                                        field
                                      ]?.sourceObjectId || selectedObjects[0].id
                                    }
                                  >
                                    <VStack align='start'>
                                      {selectedObjects.map((obj) => (
                                        <Radio key={obj.id} value={obj.id}>
                                          {renderTypeFieldValue(
                                            type.typeId,
                                            field,
                                            obj.id
                                          )}
                                        </Radio>
                                      ))}
                                    </VStack>
                                  </RadioGroup>
                                )}
                              </FormControl>
                            </Box>
                          ))}
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
              </Accordion>
            </>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            variant='ghost'
            mr={3}
            onClick={() => {
              if (isDirty) {
                if (
                  window.confirm(
                    'You have unsaved changes. Are you sure you want to close?'
                  )
                ) {
                  handleReset();
                  onClose();
                }
              } else {
                onClose();
              }
            }}
          >
            Cancel
          </Button>
          <Button colorScheme='blue' onClick={handleMerge}>
            Merge Objects
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
