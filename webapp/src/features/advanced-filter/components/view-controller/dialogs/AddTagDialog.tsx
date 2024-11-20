// components/dialogs/AddTagDialog.tsx
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
  VStack,
  Progress,
  Text,
  Tag,
  Wrap,
  WrapItem,
  useToast,
  Box,
} from '@chakra-ui/react';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import { addTagToObject } from 'src/api/object';

interface AddTagDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedObjects: any[];
  onSuccess?: () => void;
}

interface ProgressStatus {
  completed: number;
  total: number;
  currentObject: string;
  failed: string[];
}

export const AddTagDialog: React.FC<AddTagDialogProps> = ({
  isOpen,
  onClose,
  selectedObjects,
  onSuccess,
}) => {
  const { globalData } = useGlobalContext();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProgressStatus | null>(null);
  const toast = useToast();

  const tags = globalData?.tagData?.tags || [];

  const handleAddTag = async () => {
    if (!selectedTag) return;

    setIsProcessing(true);
    setProgress({
      completed: 0,
      total: selectedObjects.length,
      currentObject: selectedObjects[0].name,
      failed: [],
    });

    for (let i = 0; i < selectedObjects.length; i++) {
      const object = selectedObjects[i];

      try {
        await addTagToObject(object.id, selectedTag);

        setProgress((prev) => ({
          completed: (prev?.completed || 0) + 1,
          total: selectedObjects.length,
          currentObject:
            i < selectedObjects.length - 1 ? selectedObjects[i + 1].name : '',
          failed: prev?.failed || [],
        }));
      } catch (error) {
        setProgress((prev) => ({
          ...prev!,
          failed: [...prev!.failed, object.name],
        }));
      }
    }

    // Show completion message
    const failedCount = progress?.failed.length || 0;
    if (failedCount > 0) {
      toast({
        title: 'Tag addition completed with errors',
        description: `Failed to add tag to ${failedCount} objects`,
        status: 'warning',
        duration: 5000,
      });
    } else {
      toast({
        title: 'Tag added successfully',
        status: 'success',
        duration: 3000,
      });
      onSuccess?.();
    }

    setIsProcessing(false);
    onClose();
    setSelectedTag(null);
    setProgress(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={!isProcessing}
      closeOnEsc={!isProcessing}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Tag to Objects</ModalHeader>
        {!isProcessing && <ModalCloseButton />}
        <ModalBody>
          <VStack spacing={4} align='stretch'>
            {!isProcessing ? (
              <>
                <Text>
                  Select a tag to add to {selectedObjects.length} objects:
                </Text>
                <Wrap spacing={2}>
                  {tags.map((tag) => (
                    <WrapItem key={tag.id}>
                      <Tag
                        size='lg'
                        variant={selectedTag === tag.id ? 'solid' : 'subtle'}
                        backgroundColor={
                          selectedTag === tag.id
                            ? tag.color_schema.background
                            : `${tag.color_schema.background}40`
                        }
                        color={tag.color_schema.text}
                        cursor='pointer'
                        onClick={() => setSelectedTag(tag.id)}
                        _hover={{
                          opacity: 0.8,
                        }}
                      >
                        {tag.name}
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </>
            ) : (
              <VStack spacing={4} align='stretch'>
                <Progress
                  value={
                    ((progress?.completed || 0) / (progress?.total || 1)) * 100
                  }
                  size='sm'
                  colorScheme='blue'
                />
                <Text>
                  Processing: {progress?.completed} of {progress?.total}
                </Text>
                {progress?.currentObject && (
                  <Text fontSize='sm' color='gray.600'>
                    Current: {progress.currentObject}
                  </Text>
                )}
                {progress?.failed.length ? (
                  <VStack align='stretch' spacing={2}>
                    <Text color='red.500'>
                      Failed objects ({progress.failed.length}):
                    </Text>
                    <Box
                      maxH='100px'
                      overflowY='auto'
                      fontSize='sm'
                      color='red.500'
                    >
                      {progress.failed.map((name, i) => (
                        <Text key={i}>{name}</Text>
                      ))}
                    </Box>
                  </VStack>
                ) : null}
              </VStack>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          {!isProcessing && (
            <>
              <Button variant='ghost' mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme='blue'
                onClick={handleAddTag}
                isDisabled={!selectedTag}
              >
                Add Tag
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
