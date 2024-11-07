// components/table/AddToFunnelDialog.tsx
import React, { useState, useMemo } from 'react';
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
  Box,
  Select,
  FormControl,
  FormLabel,
  useToast,
} from '@chakra-ui/react';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import { addOrMoveObjectInFunnel } from 'src/api/object';
import { getSubStatusLabel, getSubStatusOptions } from 'src/utils/substatus';

interface AddToFunnelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedObjects: any[];
  onSuccess?: () => void;
}

interface ProgressStatus {
  completed: number;
  total: number;
  currentObject: string;
  failed: { name: string; error: string }[];
}

export const AddToFunnelDialog: React.FC<AddToFunnelDialogProps> = ({
  isOpen,
  onClose,
  selectedObjects,
  onSuccess,
}) => {
  const { globalData } = useGlobalContext();
  const [selectedFunnelId, setSelectedFunnelId] = useState<string>('');
  const [selectedStepId, setSelectedStepId] = useState<string>('');
  const [selectedSubStatus, setSelectedSubStatus] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProgressStatus | null>(null);
  const toast = useToast();

  const funnels = useMemo(
    () => globalData?.funnelData?.funnels || [],
    [globalData.funnelData.funnels]
  );

  // Get steps for selected funnel
  const selectedFunnelSteps = useMemo(() => {
    const funnel = funnels.find((f) => f.id === selectedFunnelId);
    return funnel?.steps || [];
  }, [funnels, selectedFunnelId]);

  const handleAdd = async () => {
    if (!selectedFunnelId || !selectedStepId) return;

    setIsProcessing(true);
    setProgress({
      completed: 0,
      total: selectedObjects.length,
      currentObject: selectedObjects[0].name,
      failed: [],
    });

    try {
      for (let i = 0; i < selectedObjects.length; i++) {
        const object = selectedObjects[i];

        try {
          await addOrMoveObjectInFunnel(
            object.id,
            selectedStepId,
            selectedSubStatus
          );

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
            failed: [
              ...prev!.failed,
              {
                name: object.name,
                error: error instanceof Error ? error.message : 'Unknown error',
              },
            ],
          }));
        }
      }

      const failedCount = progress?.failed.length || 0;
      if (failedCount > 0) {
        toast({
          title: 'Process completed with errors',
          description: `Failed to add ${failedCount} objects to funnel`,
          status: 'warning',
          duration: 5000,
        });
      } else {
        toast({
          title: 'Objects added to funnel successfully',
          status: 'success',
          duration: 3000,
        });
        onSuccess?.();
      }
    } finally {
      setIsProcessing(false);
      onClose();
      setSelectedFunnelId('');
      setSelectedStepId('');
      setProgress(null);
    }
  };

  const handleFunnelChange = (funnelId: string) => {
    setSelectedFunnelId(funnelId);
    setSelectedStepId(''); // Reset step selection
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
        <ModalHeader>Add to Funnel</ModalHeader>
        {!isProcessing && <ModalCloseButton />}
        <ModalBody>
          <VStack spacing={4} align='stretch'>
            {!isProcessing ? (
              <>
                <Text mb={4}>
                  Select funnel and step for {selectedObjects.length} objects:
                </Text>
                <FormControl isRequired>
                  <FormLabel>Funnel</FormLabel>
                  <Select
                    placeholder='Select funnel'
                    value={selectedFunnelId}
                    onChange={(e) => handleFunnelChange(e.target.value)}
                  >
                    {funnels.map((funnel) => (
                      <option key={funnel.id} value={funnel.id}>
                        {funnel.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {selectedFunnelId && (
                  <FormControl isRequired>
                    <FormLabel>Step</FormLabel>
                    <Select
                      placeholder='Select step'
                      value={selectedStepId}
                      onChange={(e) => setSelectedStepId(e.target.value)}
                    >
                      {selectedFunnelSteps.map((step) => (
                        <option key={step.id} value={step.id}>
                          {step.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {selectedStepId && (
                  <FormControl isRequired>
                    <FormLabel>Status</FormLabel>
                    <Select
                      placeholder='Select status'
                      value={selectedSubStatus}
                      onChange={(e) =>
                        setSelectedSubStatus(parseInt(e.target.value))
                      }
                    >
                      {getSubStatusOptions().map((opt) => (
                        <option key={opt} value={opt}>
                          {getSubStatusLabel(opt)}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}
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
                      {progress.failed.map((fail, i) => (
                        <Text key={i}>
                          {fail.name}: {fail.error}
                        </Text>
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
                onClick={handleAdd}
                isDisabled={!selectedFunnelId || !selectedStepId}
              >
                Add to Funnel
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
