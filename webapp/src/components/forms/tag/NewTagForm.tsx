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
  useToast,
} from '@chakra-ui/react';
import { CreateTagParams } from 'src/api/tag';
import { Tag } from 'src/types/Tag';
import {
  getRandomDarkColor,
  getRandomBrightColor,
  normalizeToTagStyle,
} from 'src/utils';

interface NewTagFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTag: (newTag: CreateTagParams) => Promise<void>;
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
  const [backgroundColor, setBackgroundColor] = useState(getRandomDarkColor());
  const [textColor, setTextColor] = useState(getRandomBrightColor());
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      existingTags.some((tag) => tag.name.toLowerCase() === name.toLowerCase())
    ) {
      toast({
        title: 'Tag already exists',
        description: 'Please choose a different name.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newTag: CreateTagParams = {
      name: normalizeToTagStyle(name),
      description,
      color_schema: {
        background: backgroundColor,
        text: textColor,
      },
    };

    try {
      await onAddTag(newTag);
      setName('');
      setDescription('');
      setBackgroundColor(getRandomDarkColor());
      setTextColor(getRandomBrightColor());
      onClose();
    } catch (error) {
      toast({
        title: 'Error creating tag',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Tag</ModalHeader>
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
                  onChange={(e) => setDescription(e.target.value || '')}
                />
              </FormControl>
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
            </VStack>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme='blue' mr={3} onClick={handleSubmit}>
            Create
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
