import {
  Button,
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Text,
  useToast,
  Switch,
} from '@chakra-ui/react';
import React from 'react';
import { IconType } from 'react-icons';
import FaIconList from 'src/components/FaIconList';
import { SmartObjectForm } from 'src/features/smart-object-type';
import { ObjectTypeValue, ObjectType } from 'src/types';

interface EditObjectTypeValueModalProps {
  isOpen: boolean;
  onClose: () => void;
  objectType: ObjectType;
  objectTypeValue: ObjectTypeValue;
  onUpdate: (payload: any) => void;
  onDelete: () => void;
}
const EditObjectTypeValueModal = ({
  isOpen,
  onClose,
  objectType,
  objectTypeValue,
  onUpdate,
  onDelete,
}: EditObjectTypeValueModalProps) => {
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [editedValues, setEditedValues] = React.useState(
    objectTypeValue.type_values
  );
  const [isDirty, setIsDirty] = React.useState(false);
  const toast = useToast();

  const handleReset = () => {
    setEditedValues(objectTypeValue.type_values);
  };
  const handleDelete = () => {
    const cfm = window.confirm(
      'Are you sure you want to delete this object type value?'
    );
    if (!cfm) return;
    onDelete();
  };
  const handleUpdate = async () => {
    try {
      await onUpdate({ type_values: editedValues });
      toast({
        title: 'Success',
        description: 'Object type value updated',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setIsDirty(false);
    } catch (e) {
      handleReset();
      toast({
        title: 'Error',
        description: 'Failed to update object type value',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onClose();
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (isDirty) {
          const cfm = window.confirm(
            'Are you sure you want to abandon all changes?'
          );
          if (!cfm) return;
        }
        handleReset();
        onClose();
      }}
      size='xl'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex direction='row' alignItems={'center'}>
            <Flex direction='row' alignItems={'center'}>
              {FaIconList[objectType?.icon as keyof IconType]}{' '}
              <Text ml={2}>{objectType?.name || 'Unknown Type'}</Text>
            </Flex>
            <Spacer />
            <Flex direction='row' alignItems={'center'} fontSize={'sm'}>
              <Text mr={2}>Edit</Text>
              <Switch
                isChecked={isEditMode}
                onChange={() => setIsEditMode(!isEditMode)}
              />
            </Flex>
          </Flex>
        </ModalHeader>
        <ModalBody>
          <SmartObjectForm
            config={{
              fields: objectType.fields,
            }}
            initialValues={objectTypeValue.type_values}
            mode={isEditMode ? 'edit' : 'view'}
            onChange={(values) => {
              setEditedValues(values);
              setIsDirty(true);
            }}
          />
        </ModalBody>
        <ModalFooter>
          {isEditMode && (
            <HStack spacing={2}>
              <Button onClick={handleReset}>Reset</Button>
              <Button colorScheme='blue' onClick={handleUpdate}>
                Update
              </Button>
              <Button colorScheme='red' onClick={handleDelete}>
                Delete
              </Button>
            </HStack>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditObjectTypeValueModal;
