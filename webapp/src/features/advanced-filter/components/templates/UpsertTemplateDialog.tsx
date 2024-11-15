import { useState } from 'react';
import { Template } from '../../types/template';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
  VStack,
} from '@chakra-ui/react';
import MarkdownEditor from 'src/components/mardown/MardownEditor';
import { createList } from 'src/api/list';
import { useHistory } from 'react-router-dom';

interface UpsertTemplateDialogProps {
  template: Template;
  onClose: () => void;
  isOpen: boolean;
}
const UpsertTemplateDialog = ({
  template,
  onClose,
  isOpen,
}: UpsertTemplateDialogProps) => {
  const id = template.id;
  const [name, setName] = useState(template.name || '');
  const [description, setDescription] = useState(template.description || '');
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();
  const handleSave = async () => {
    if (!name || !description || !template.config) {
      toast({
        title: 'Error',
        description: 'Name, description and setting are required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      if (!id) {
        setIsLoading(true);
        const saved = await createList({
          name,
          description,
          filterSetting: template.config,
        });
        toast({
          title: 'Success',
          description: 'Template saved',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        history.push(`/views/${saved.creatorListId}`);
      } else {
        // update
        console.log('do not support for now');
      }
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleClose = () => {
    setName('');
    setDescription('');
    onClose();
  };
  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{id ? 'Edit' : 'Create'} Template</ModalHeader>
        <ModalCloseButton onClick={handleClose} />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Description</FormLabel>
              <MarkdownEditor
                initialValue={description}
                onChange={setDescription}
                filters={[]}
                isDisabled={isLoading}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme='blue'
            onClick={handleSave}
            isLoading={isLoading}
            isDisabled={name === '' || description === ''}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export { UpsertTemplateDialog };
