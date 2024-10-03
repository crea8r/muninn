// ObjectTypeCard.tsx
import React from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  VStack,
  HStack,
  useToast,
} from '@chakra-ui/react';
import { ObjectType, ObjectTypeValue } from 'src/types/';
import { MasterFormElement } from 'src/components/rich-object-form/MasterFormElement';
import FaIconList from 'src/components/FaIconList';
import { IconType } from 'react-icons';

interface ObjectTypeCardProps {
  objectTypeValue: ObjectTypeValue;
  objectType?: ObjectType;
  onUpdate: (payload: any) => void;
  onDelete: () => void;
}

const ObjectTypeCard: React.FC<ObjectTypeCardProps> = ({
  objectTypeValue,
  objectType,
  onUpdate,
  onDelete,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editedValues, setEditedValues] = React.useState(
    objectTypeValue.type_values
  );
  const toast = useToast();

  const cardContent = Object.entries(objectTypeValue.type_values)
    .filter(
      ([, value]) => value !== null && value !== undefined && value !== ''
    )
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')
    .slice(0, 200);

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

  const handleReset = () => {
    setEditedValues(objectTypeValue.type_values);
  };
  return (
    <>
      <Box
        borderWidth={1}
        borderRadius='md'
        p={4}
        onClick={onOpen}
        cursor='pointer'
      >
        <Heading size='sm' display={'flex'} alignItems={'center'}>
          {FaIconList[objectType?.icon as keyof IconType]}{' '}
          <Text ml={1}>{objectType?.name || 'Unknown Type'}</Text>
        </Heading>
        <Text noOfLines={3}>{cardContent}</Text>
      </Box>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          handleReset();
          onClose();
        }}
        size='xl'
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{objectType?.name || 'Unknown Type'}</ModalHeader>
          <ModalBody>
            <VStack spacing={4} align='stretch'>
              {Object.entries(editedValues).map(([key, value]) => (
                <MasterFormElement
                  key={key}
                  field={key}
                  value={value}
                  onChange={(value) =>
                    setEditedValues({ ...editedValues, [key]: value })
                  }
                  dataType={objectType?.fields[key]}
                />
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={2}>
              <Button onClick={handleReset}>Reset</Button>
              <Button colorScheme='blue' onClick={handleUpdate}>
                Update
              </Button>
              <Button colorScheme='red' onClick={onDelete}>
                Delete
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ObjectTypeCard;
