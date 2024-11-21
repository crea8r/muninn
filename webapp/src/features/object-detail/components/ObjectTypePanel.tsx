import React, { useState, useCallback } from 'react';
import { Box, useDisclosure, useToast, SimpleGrid } from '@chakra-ui/react';
import { ObjectType, ObjectTypeValue } from 'src/types/';
import ObjectTypeCard from 'src/components/forms/object/object-type/ObjectTypeCard';
import AddObjectTypeValueModal from 'src/components/forms/object/object-type/AddObjectTypeValueModal';
import EditObjectTypeValueModal from 'src/components/forms/object/object-type/EditObjectTypeModal';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import {
  addObjectTypeValue,
  removeObjectTypeValue,
  updateObjectTypeValue,
} from 'src/api';
import { useObjectDetail } from '../contexts/ObjectDetailContext';
import { FaPlus } from 'react-icons/fa';

export const ObjectTypePanel: React.FC = () => {
  const { globalData } = useGlobalContext();
  const { object } = useObjectDetail();
  const objectId = object?.id;
  const objectTypes = object?.typeValues || [];
  const availableTypes = globalData?.objectTypeData?.objectTypes || [];
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const [currentObjectTypeValue, setCurrentObjectTypeValue] = useState<
    ObjectTypeValue | undefined
  >();
  const [currentObjectType, setCurrentObjectType] = useState<
    ObjectType | undefined
  >();

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
      <SimpleGrid gap={2}>
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

      {currentObjectType && currentObjectTypeValue && (
        <EditObjectTypeValueModal
          isOpen={isEditOpen}
          onClose={handleCloseEditModal}
          objectType={currentObjectType}
          objectTypeValue={currentObjectTypeValue}
          onUpdate={(payload) =>
            updateObjectTypeValue(objectId, currentObjectTypeValue.id, payload)
          }
          onDelete={() => {
            removeObjectTypeValue(objectId, currentObjectTypeValue.id);
          }}
        />
      )}
    </Box>
  );
};

export const CreateObjectTypeValueButton = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { globalData } = useGlobalContext();
  const availableTypes = globalData?.objectTypeData?.objectTypes || [];
  const { object } = useObjectDetail();
  const objectId = object?.id;
  const objectTypes = object?.typeValues || [];
  const toast = useToast();
  const handleAddType = async (payload: any) => {
    try {
      await addObjectTypeValue(objectId, payload);
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
    }
  };
  return (
    <>
      <FaPlus onClick={onOpen} />
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
    </>
  );
};
