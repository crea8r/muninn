// components/table/MergeObjectsDialog.tsx
import React, { useState, useMemo } from 'react';
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
  Divider,
  FormControl,
  FormLabel,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Checkbox,
} from '@chakra-ui/react';
import { useGlobalContext } from 'src/contexts/GlobalContext';

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
}

export const MergeObjectsDialog: React.FC<MergeObjectsDialogProps> = ({
  isOpen,
  onClose,
  selectedObjects,
  onSuccess,
}) => {
  const toast = useToast();
  const { globalData } = useGlobalContext();
  const [mergeConfig, setMergeConfig] = useState<MergeConfig>(() => {
    const firstObject = selectedObjects[0];
    return {
      name: firstObject?.id,
      description: firstObject?.id,
      id_string: firstObject?.id,
      typeValues: {},
    };
  });

  // Get overlapping object types and their fields
  const overlappingTypes = useMemo(() => {
    const typeFrequency: Record<
      string,
      {
        count: number;
        fields: Set<string>;
        typeName?: string;
      }
    > = {};

    selectedObjects.forEach((obj) => {
      obj.type_values?.forEach((tv: any) => {
        if (!typeFrequency[tv.objectTypeId]) {
          const objectType = globalData?.objectTypeData?.objectTypes.find(
            (t) => t.id === tv.objectTypeId
          );
          typeFrequency[tv.objectTypeId] = {
            count: 1,
            fields: new Set(Object.keys(tv.type_values)),
            typeName: objectType?.name,
          };
        } else {
          typeFrequency[tv.objectTypeId].count++;
          Object.keys(tv.type_values).forEach((field) =>
            typeFrequency[tv.objectTypeId].fields.add(field)
          );
        }
      });
    });

    // Only return types that appear in multiple objects
    return Object.entries(typeFrequency)
      .filter(([_, data]) => data.count > 1)
      .map(([typeId, data]) => ({
        typeId,
        typeName: data.typeName || 'Unknown Type',
        fields: Array.from(data.fields),
      }));
  }, [selectedObjects, globalData]);

  const handleBasicFieldChange =
    (field: keyof Pick<MergeConfig, 'name' | 'description' | 'id_string'>) =>
    (value: string) => {
      setMergeConfig((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleTypeFieldChange =
    (typeId: string, field: string) => (selection: FieldSelection) => {
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

      // TODO: Call API to merge objects
      console.log('Merged object:', mergedObject);

      toast({
        title: 'Objects merged successfully',
        status: 'success',
        duration: 3000,
      });
      onSuccess?.();
      onClose();
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='xl'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Merge {selectedObjects.length} Objects</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align='stretch'>
            <Text>Choose values for the merged object:</Text>

            {/* Basic Fields */}
            <Box>
              <Text fontWeight='bold' mb={2}>
                Basic Fields
              </Text>
              {(['name', 'description', 'id_string'] as const).map((field) => (
                <FormControl key={field} mt={2}>
                  <FormLabel>{field}</FormLabel>
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
              ))}
            </Box>
            {overlappingTypes?.length > 0 && (
              <>
                <Divider />
                <Text fontWeight='bold' mb={2}>
                  Merge Object Type Fields
                </Text>
                {/* Object Type Fields */}
                <Accordion allowMultiple>
                  {overlappingTypes.map((type) => (
                    <AccordionItem key={type.typeId}>
                      <AccordionButton>
                        <Box flex='1' textAlign='left'>
                          <Text fontWeight='bold'>{type.typeName}</Text>
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
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant='ghost' mr={3} onClick={onClose}>
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
