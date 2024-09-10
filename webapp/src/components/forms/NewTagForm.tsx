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
  HStack,
  useToast,
} from '@chakra-ui/react';

import { Tag } from '../../types';

interface NewTagFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTag: (newTag: Omit<Tag, 'id'>) => void;
  existingTags: Tag[];
}

const NewTagForm: React.FC<NewTagFormProps> = ({
  isOpen,
  onClose,
  onAddTag,
  existingTags,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const toast = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      existingTags.some((tag) => tag.name.toLowerCase() === name.toLowerCase())
    ) {
      toast({
        title: 'Error',
        description: 'Tag name must be unique',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newTag: Omit<Tag, 'id'> = {
      name,
      description,
      color_schema: {
        background: backgroundColor,
        text: textColor,
      },
    };

    onAddTag(newTag);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setBackgroundColor('#000000');
    setTextColor('#FFFFFF');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Tag</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </FormControl>
              <HStack width='100%'>
                <FormControl>
                  <FormLabel>Background Color</FormLabel>
                  <Input
                    type='color'
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Text Color</FormLabel>
                  <Input
                    type='color'
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                  />
                </FormControl>
              </HStack>
            </VStack>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme='blue' mr={3} onClick={handleSubmit}>
            Add Tag
          </Button>
          <Button variant='ghost' onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NewTagForm;
