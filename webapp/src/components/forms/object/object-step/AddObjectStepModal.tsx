import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { Funnel, StepAndFunnel, FunnelStep } from 'src/types';
import { shortenText } from 'src/utils';

interface AddObjectStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableFunnels: Funnel[];
  onAddToFunnel: (stepId: string) => void;
  stepsAndFunnels: StepAndFunnel[];
}

const AddObjectStepModal = ({
  isOpen,
  onClose,
  availableFunnels,
  onAddToFunnel,
  stepsAndFunnels,
}: AddObjectStepModalProps) => {
  const [selectedFunnel, setSelectedFunnel] = useState<string>('');
  const [selectedStep, setSelectedStep] = useState<string>('');
  const handleReset = () => {
    setSelectedFunnel('');
    setSelectedStep('');
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
    >
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
              value={selectedFunnel}
            >
              {availableFunnels
                .filter(
                  (funnel) =>
                    !stepsAndFunnels.some(
                      (of) => of.funnelId === funnel.id && !of.deletedAt
                    )
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
                {availableFunnels
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
                  availableFunnels
                    .find((f) => f.id === selectedFunnel)
                    ?.steps.find((s: FunnelStep) => s.id === selectedStep)
                    ?.definition
                }
              </Text>
              <Text mt={2}>
                <strong>Example:</strong>{' '}
                {shortenText(
                  availableFunnels
                    .find((f) => f.id === selectedFunnel)
                    ?.steps.find((s: FunnelStep) => s.id === selectedStep)
                    ?.example || '',
                  50
                )}
              </Text>
              <Text mt={2}>
                <strong>Action to take:</strong>{' '}
                {shortenText(
                  availableFunnels
                    .find((f) => f.id === selectedFunnel)
                    ?.steps.find((s: FunnelStep) => s.id === selectedStep)
                    ?.action || '',
                  50
                )}
              </Text>
            </Box>
          )}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme='gray' onClick={handleReset}>
            Reset
          </Button>
          <Button
            ml={4}
            colorScheme='blue'
            onClick={() => {
              if (!selectedFunnel || !selectedStep) return;
              onAddToFunnel(selectedStep);
              handleReset();
            }}
            isDisabled={!selectedFunnel || !selectedStep}
          >
            Add to Funnel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddObjectStepModal;
