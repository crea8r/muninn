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
  VStack,
  useToast,
} from '@chakra-ui/react';
import { UpdateTagParams } from 'src/api/tag';
import { Tag } from 'src/types/Tag';

interface EditTagFormProps {
  isOpen: boolean;
  onClose: () => void;
  onEditTag: (id: string, updatedTag: UpdateTagParams) => Promise<void>;
  tag: Tag;
}

const EditTagForm: React.FC<EditTagFormProps> = ({
  isOpen,
  onClose,
  onEditTag,
  tag,
}) => {
  const [description, setDescription] = useState(tag.description);
  const [backgroundColor, setBackgroundColor] = useState(
    tag.color_schema.background
  );
  const [textColor, setTextColor] = useState(tag.color_schema.text);
  const toast = useToast();
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // Update form when tag prop changes
    setDescription(tag.description);
    setBackgroundColor(tag.color_schema.background);
    setTextColor(tag.color_schema.text);
    setIsDirty(true);
  }, [tag]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedTag: UpdateTagParams = {
      description,
      color_schema: {
        background: backgroundColor,
        text: textColor,
      },
    };

    try {
      await onEditTag(tag.id.toString(), updatedTag);
      onClose();
      toast({
        title: 'Tag updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsDirty(false);
    } catch (error) {
      toast({
        title: 'Error updating tag',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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
        setIsDirty(false);
        onClose();
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Tag: {tag.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
            Update
          </Button>
          <Button variant='ghost' onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditTagForm;
