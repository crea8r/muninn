import React, { useState, useCallback } from 'react';
import {
  Box,
  VStack,
  Button,
  useDisclosure,
  useToast,
  SimpleGrid,
} from '@chakra-ui/react';
import { ObjectType, ObjectTypeValue } from 'src/types/';
import ObjectTypeCard from 'src/components/forms/object/object-type/ObjectTypeCard';
import AddObjectTypeValueModal from 'src/components/forms/object/object-type/AddObjectTypeValueModal';
import EditObjectTypeValueModal from 'src/components/forms/object/object-type/EditObjectTypeModal';
import { useGlobalContext } from 'src/contexts/GlobalContext';

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
  const { globalData } = useGlobalContext();
  const availableTypes = globalData?.objectTypeData?.objectTypes || [];
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const toast = useToast();
  const [currentObjectTypeValue, setCurrentObjectTypeValue] = useState<
    ObjectTypeValue | undefined
  >();
  const [currentObjectType, setCurrentObjectType] = useState<
    ObjectType | undefined
  >();

  const handleAddType = async (payload: any) => {
    try {
      setIsLoading(true);
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
        description:
          typeof error === 'string' ? error : 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickObjectCard = useCallback(
    (objectType: ObjectType, objectTypeValue: ObjectTypeValue) => {
      setCurrentObjectTypeValue(objectTypeValue);
      setCurrentObjectType(objectType);
      onEditOpen();
    },
    [onEditOpen]
  );

  const handleCloseEditModal = useCallback(() => {
    setCurrentObjectTypeValue(undefined);
    setCurrentObjectType(undefined);
    onEditClose();
  }, [onEditClose]);

  return (
    <Box>
      <VStack align='stretch' spacing={4}>
        <SimpleGrid columns={[1, 2]} spacing={4}>
          {objectTypes.map((typeValue) => (
            <ObjectTypeCard
              key={typeValue.id}
              objectType={availableTypes.find(
                (type) => type.id === typeValue.objectTypeId
              )}
              objectTypeValue={typeValue}
              onOpen={handleClickObjectCard}
            />
          ))}
        </SimpleGrid>
        <Button onClick={onOpen} isLoading={isLoading}>
          Add New Type
        </Button>
      </VStack>

      <AddObjectTypeValueModal
        isOpen={isOpen}
        onClose={onClose}
        availableTypes={availableTypes.filter((availType: ObjectType) => {
          return !objectTypes.some(
            (o: ObjectTypeValue) => o.objectTypeId === availType.id
          );
        })}
        onAddType={handleAddType}
      />
      {currentObjectType && currentObjectTypeValue && (
        <EditObjectTypeValueModal
          isOpen={isEditOpen}
          onClose={handleCloseEditModal}
          objectType={currentObjectType}
          objectTypeValue={currentObjectTypeValue}
          onUpdate={(payload) =>
            onUpdateObjectTypeValue(
              objectId,
              currentObjectTypeValue.id,
              payload
            )
          }
          onDelete={() =>
            onRemoveObjectTypeValue(objectId, currentObjectTypeValue.id)
          }
        />
      )}
    </Box>
  );
};

export default ObjectTypePanel;
