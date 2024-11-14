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
  Flex,
  Tag as ChakraTag,
  Text,
} from '@chakra-ui/react';
import { CreateTagParams } from 'src/api/tag';
import { Tag } from 'src/types/Tag';
import {
  getRandomDarkColor,
  getRandomBrightColor,
  normalizeToTagStyle,
} from 'src/utils';
import { getShades } from 'src/utils/color';

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
  const [baseColor, setBaseColor] = useState(getRandomBrightColor());
  const [backgroundColor, setBackgroundColor] = useState(
    getShades(baseColor).lighterShade
  );
  const [textColor, setTextColor] = useState(getShades(baseColor).darkerShade);
  const [isDirty, setIsDirty] = useState(false);
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
      setIsDirty(false);
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
  const handleClose = () => {
    if (isDirty) {
      const cfm = window.confirm(
        'Are you sure you want to discard your changes?'
      );
      if (!cfm) return;
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex gap={2}>
            <Text>New Tag</Text>
            <ChakraTag color={textColor} background={backgroundColor}>
              {name || 'Untitled'}
            </ChakraTag>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => {
                    setIsDirty(true);
                    setName(e.target.value);
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input
                  value={description}
                  onChange={(e) => {
                    setIsDirty(true);
                    setDescription(e.target.value || '');
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Base Color</FormLabel>
                <Input
                  type='color'
                  value={baseColor}
                  onChange={(e) => {
                    setIsDirty(true);
                    const { lighterShade, darkerShade } = getShades(
                      e.target.value
                    );
                    setBaseColor(e.target.value);
                    setBackgroundColor(lighterShade);
                    setTextColor(darkerShade);
                  }}
                />
              </FormControl>
            </VStack>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme='blue' mr={3} onClick={handleSubmit}>
            Create
          </Button>
          <Button variant='ghost' onClick={handleClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NewTagForm;
