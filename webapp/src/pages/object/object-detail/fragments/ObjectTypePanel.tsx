import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Button,
  useDisclosure,
  useToast,
  SimpleGrid,
} from '@chakra-ui/react';
import { ObjectType, ObjectTypeValue } from 'src/types/';
import { listObjectTypes } from 'src/api/objType';
import ObjectTypeCard from 'src/components/forms/object/object-type/ObjectTypeCard';
import AddObjectTypeModal from 'src/components/forms/object/object-type/AddObjectTypeModal';
import LoadingPanel from 'src/components/LoadingPanel';

interface ObjectTypePanelProps {
  objectId: string;
  objectTypes: ObjectTypeValue[];
  onAddObjectTypeValue: (objectId: string, payload: any) => void;
  onRemoveObjectTypeValue: (objectId: string, objTypeValueId: string) => void;
  onUpdateObjectTypeValue: (
    objectId: string,
    objTypeValueId: string,
    payload: any
  ) => void;
}

const ObjectTypePanel: React.FC<ObjectTypePanelProps> = ({
  objectId,
  objectTypes,
  onAddObjectTypeValue,
  onRemoveObjectTypeValue,
  onUpdateObjectTypeValue,
}) => {
  const [availableTypes, setAvailableTypes] = useState<ObjectType[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadObjectTypes = async () => {
      try {
        setIsLoading(true);
        const resp = await listObjectTypes({
          page: 1,
          pageSize: 100,
        });
        setAvailableTypes(resp.objectTypes);
      } catch (error) {
        toast({
          title: 'Error loading object types',
          description: 'Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadObjectTypes();
  }, [objectId, toast]);

  const handleAddType = async (payload: any) => {
    try {
      await onAddObjectTypeValue(objectId, payload);
      onClose();
      toast({
        title: 'Object type added',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error adding object type',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      {isLoading ? (
        <LoadingPanel />
      ) : (
        <VStack align='stretch' spacing={4}>
          <SimpleGrid columns={[1, 2]} spacing={4}>
            {objectTypes.map((typeValue) => (
              <ObjectTypeCard
                key={typeValue.id}
                objectTypeValue={typeValue}
                objectType={availableTypes.find(
                  (type) => type.id === typeValue.objectTypeId
                )}
                onUpdate={(payload) =>
                  onUpdateObjectTypeValue(objectId, typeValue.id, payload)
                }
                onDelete={() => onRemoveObjectTypeValue(objectId, typeValue.id)}
              />
            ))}
          </SimpleGrid>
          <Button onClick={onOpen}>Add New Type</Button>
        </VStack>
      )}

      <AddObjectTypeModal
        isOpen={isOpen}
        onClose={onClose}
        availableTypes={availableTypes}
        onAddType={handleAddType}
      />
    </Box>
  );
};

export default ObjectTypePanel;
