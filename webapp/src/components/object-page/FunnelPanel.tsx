import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Select,
  useToast,
  Switch,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useDisclosure,
} from '@chakra-ui/react';
import { Funnel, FunnelStep, ObjectFunnel } from '../../types/';
import {
  fetchObjectFunnels,
  addObjectToFunnel,
  moveObjectInFunnel,
  removeObjectFromFunnel,
} from 'src/api';
import { fetchAllFunnels } from 'src/api/funnel';

interface FunnelPanelProps {
  objectId: string;
}

const FunnelPanel: React.FC<FunnelPanelProps> = ({ objectId }) => {
  const [objectFunnels, setObjectFunnels] = useState<ObjectFunnel[]>([]);
  const [allFunnels, setAllFunnels] = useState<Funnel[]>([]);
  const [selectedFunnel, setSelectedFunnel] = useState<string>('');
  const [selectedStep, setSelectedStep] = useState<string>('');
  const [showHidden, setShowHidden] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    const loadFunnels = async () => {
      try {
        const [objectFunnelsData, allFunnelsData] = await Promise.all([
          fetchObjectFunnels(objectId),
          fetchAllFunnels(),
        ]);
        setObjectFunnels(objectFunnelsData);
        setAllFunnels(allFunnelsData.funnels);
      } catch (error) {
        toast({
          title: 'Error loading funnels',
          description: 'Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    loadFunnels();
  }, [objectId, toast]);

  const handleAddToFunnel = async () => {
    if (!selectedFunnel || !selectedStep) return;

    try {
      const newObjectFunnel = await addObjectToFunnel(
        objectId,
        selectedFunnel,
        selectedStep
      );
      setObjectFunnels([...objectFunnels, newObjectFunnel]);
      onClose();
      toast({
        title: 'Object added to funnel',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error adding object to funnel',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleMoveInFunnel = async (funnelId: string, newStepId: string) => {
    try {
      const updatedObjectFunnel = await moveObjectInFunnel(
        objectId,
        funnelId,
        newStepId
      );
      setObjectFunnels(
        objectFunnels.map((of) =>
          of.funnelId === funnelId ? updatedObjectFunnel : of
        )
      );
      toast({
        title: 'Object moved in funnel',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error moving object in funnel',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRemoveFromFunnel = async (funnelId: string) => {
    try {
      await removeObjectFromFunnel(objectId, funnelId);
      setObjectFunnels(objectFunnels.filter((of) => of.funnelId !== funnelId));
      toast({
        title: 'Object removed from funnel',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error removing object from funnel',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const isLastStep = (funnel: Funnel, stepId: string) => {
    return funnel.steps[funnel.steps.length - 1].id === stepId;
  };

  return (
    <Box>
      <VStack align='stretch' spacing={4}>
        <Heading size='md'>Funnels</Heading>
        <FormControl display='flex' alignItems='center'>
          <FormLabel htmlFor='show-hidden' mb='0'>
            Show completed funnels
          </FormLabel>
          <Switch
            id='show-hidden'
            onChange={(e) => setShowHidden(e.target.checked)}
          />
        </FormControl>
        {objectFunnels.map((objectFunnel) => {
          const funnel = allFunnels.find((f) => f.id === objectFunnel.funnelId);
          if (!funnel) return null;
          const currentStep = funnel.steps.find(
            (step: FunnelStep) => step.id === objectFunnel.stepId
          );
          if (!currentStep) return null;

          if (isLastStep(funnel, currentStep.id) && !showHidden) return null;

          return (
            <Box
              key={objectFunnel.funnelId}
              borderWidth={1}
              borderRadius='md'
              p={4}
            >
              <Heading size='sm'>{funnel.name}</Heading>
              <Text>Current Step: {currentStep.name}</Text>
              {isLastStep(funnel, currentStep.id) && (
                <Text color='green.500' fontWeight='bold'>
                  Completed
                </Text>
              )}
              <FormControl mt={2}>
                <FormLabel>Move to</FormLabel>
                <Select
                  value={currentStep.id}
                  onChange={(e) =>
                    handleMoveInFunnel(objectFunnel.funnelId, e.target.value)
                  }
                >
                  {funnel.steps.map((step: FunnelStep) => (
                    <option key={step.id} value={step.id}>
                      {step.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <Button
                mt={2}
                colorScheme='red'
                size='sm'
                onClick={() => handleRemoveFromFunnel(objectFunnel.funnelId)}
              >
                Remove from Funnel
              </Button>
            </Box>
          );
        })}
        <Button onClick={onOpen}>Add to New Funnel</Button>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add to New Funnel</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Select Funnel</FormLabel>
              <Select
                placeholder='Select funnel'
                onChange={(e) => {
                  setSelectedFunnel(e.target.value);
                  setSelectedStep('');
                }}
              >
                {allFunnels
                  .filter(
                    (funnel) =>
                      !objectFunnels.some((of) => of.funnelId === funnel.id)
                  )
                  .map((funnel) => (
                    <option key={funnel.id} value={funnel.id}>
                      {funnel.name}
                    </option>
                  ))}
              </Select>
            </FormControl>
            {selectedFunnel && (
              <FormControl mt={4}>
                <FormLabel>Select Step</FormLabel>
                <Select
                  placeholder='Select step'
                  onChange={(e) => setSelectedStep(e.target.value)}
                >
                  {allFunnels
                    .find((funnel) => funnel.id === selectedFunnel)
                    ?.steps.map((step: FunnelStep) => (
                      <option key={step.id} value={step.id}>
                        {step.name}
                      </option>
                    ))}
                </Select>
              </FormControl>
            )}
            {selectedStep && (
              <Box mt={4}>
                <Text fontWeight='bold'>Step Details:</Text>
                <Text>
                  {
                    allFunnels
                      .find((f) => f.id === selectedFunnel)
                      ?.steps.find((s: FunnelStep) => s.id === selectedStep)
                      ?.definition
                  }
                </Text>
                <Text mt={2}>
                  <strong>Example:</strong>{' '}
                  {
                    allFunnels
                      .find((f) => f.id === selectedFunnel)
                      ?.steps.find((s: FunnelStep) => s.id === selectedStep)
                      ?.example
                  }
                </Text>
                <Text mt={2}>
                  <strong>Action to take:</strong>{' '}
                  {
                    allFunnels
                      .find((f) => f.id === selectedFunnel)
                      ?.steps.find((s: FunnelStep) => s.id === selectedStep)
                      ?.action
                  }
                </Text>
              </Box>
            )}
            <Button
              mt={4}
              colorScheme='blue'
              onClick={handleAddToFunnel}
              isDisabled={!selectedFunnel || !selectedStep}
            >
              Add to Funnel
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default FunnelPanel;
