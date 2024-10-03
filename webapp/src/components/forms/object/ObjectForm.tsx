import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  InputGroup,
  InputRightAddon,
  FormHelperText,
  useToast,
} from '@chakra-ui/react';
import { v4 as uuidv4 } from 'uuid';
import { NewObject, UpdateObject } from 'src/types';
import MarkdownEditor from 'src/components/mardown/MardownEditor';

interface ObjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateObject?: (newObject: NewObject) => Promise<void>;
  initialObject?: UpdateObject; // Optional prop for editing an existing object
  onUpdateObject?: (updatedObject: UpdateObject) => Promise<void>; // Optional prop for updating an existing object
}

const ObjectForm: React.FC<ObjectFormProps> = ({
  isOpen,
  onClose,
  onCreateObject,
  initialObject,
  onUpdateObject,
}) => {
  const [name, setName] = useState(initialObject?.name || '');
  const [idString, setIDString] = useState(initialObject?.idString || uuidv4());
  const [description, setDescription] = useState(
    initialObject?.description || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!initialObject && onCreateObject) {
      try {
        await onCreateObject({ name, description, idString });
        toast({
          title: 'Success',
          description: 'Object successfully created.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        onClose();
      } catch (error) {
        console.error('Error creating object:', error);
        toast({
          title: 'Error creating object',
          description: 'Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsSubmitting(false);
      }
    } else if (initialObject && onUpdateObject) {
      try {
        await onUpdateObject({
          id: initialObject.id,
          name,
          description,
          idString,
        });
        toast({
          title: 'Success',
          description: 'Object successfully edited.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        onClose();
      } catch (error) {
        console.error('Error updating object:', error);
        toast({
          title: 'Error updating object',
          description: 'Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleGenerateId = () => {
    setIDString(uuidv4());
  };

  const onReset = () => {
    if (!initialObject) {
      setName('');
      setIDString(uuidv4());
      setDescription('');
    } else {
      setName(initialObject.name);
      setIDString(initialObject.idString);
      setDescription(initialObject.description);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onReset();
        onClose();
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {initialObject ? 'Edit Object' : 'Create New Object'}
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='Enter object name'
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>ID String</FormLabel>
                <FormHelperText>
                  Use unique ID string to import object data from csv or any
                  thirdparty system. You can let the system generate one for you
                  or create one yourself.
                </FormHelperText>
                <InputGroup marginTop={4}>
                  <Input
                    value={idString}
                    onChange={(e) => setIDString(e.target.value)}
                    placeholder='Object id string, useful for adding info from csv'
                  />
                  <InputRightAddon>
                    <Button
                      variant='ghost'
                      title='Auto generate the UUID'
                      onClick={handleGenerateId}
                    >
                      Generate
                    </Button>
                  </InputRightAddon>
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <MarkdownEditor
                  initialValue={description}
                  onChange={setDescription}
                  filters={[]}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onReset}>
              Reset
            </Button>
            <Button variant='ghost' mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme='blue' type='submit' isLoading={isSubmitting}>
              {initialObject ? 'Edit' : 'Create'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default ObjectForm;
