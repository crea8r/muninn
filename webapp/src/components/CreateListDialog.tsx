import React, { useState, useEffect } from 'react';
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
  useToast,
} from '@chakra-ui/react';
import { createList, CreateListResponse } from 'src/api/list';
import MarkdownEditor from './mardown/MardownEditor';

interface CreateListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onListCreated: (list: CreateListResponse) => void;
  filterSetting: object;
}

const CreateListDialog: React.FC<CreateListDialogProps> = ({
  isOpen,
  onClose,
  onListCreated,
  filterSetting,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    resetForm();
  }, [isOpen]);

  const resetForm = () => {
    setName('');
    setDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const listData = {
        name,
        description,
        filterSetting,
      };
      const result = await createList(listData);
      onListCreated(result);
      toast({
        title: 'List created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{'Save As New List'}</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='Enter list name'
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <MarkdownEditor
                  initialValue={description}
                  onChange={setDescription}
                  filters={[]}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Filter Settings (JSON)</FormLabel>
                <Textarea
                  value={JSON.stringify(filterSetting)}
                  placeholder='Enter filter settings in JSON format'
                  minHeight='150px'
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

export default CreateListDialog;
