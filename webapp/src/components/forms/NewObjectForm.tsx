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
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';

interface NewObjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateObject: (
    name: string,
    description: string,
    idString: string
  ) => Promise<string>;
}

const NewObjectForm: React.FC<NewObjectFormProps> = ({
  isOpen,
  onClose,
  onCreateObject,
}) => {
  const [name, setName] = useState('');
  const [idString, setIDString] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const history = useHistory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newObjectId = await onCreateObject(name, description, idString);
      onClose();
      history.push(`/objects/${newObjectId}`);
    } catch (error) {
      console.error('Error creating object:', error);
      // Handle error (e.g., show an error message to the user)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Object</ModalHeader>
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
                <Input
                  value={idString}
                  onChange={(e) => setIDString(e.target.value)}
                  placeholder='Object id string, useful for adding info from csv'
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Enter object description'
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme='blue' type='submit' isLoading={isSubmitting}>
              Create
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default NewObjectForm;
