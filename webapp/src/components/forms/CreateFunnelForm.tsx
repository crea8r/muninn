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
  VStack,
  Input,
  Textarea,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Text,
  IconButton,
  HStack,
} from '@chakra-ui/react';
import {
  AddIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  DeleteIcon,
  InfoIcon,
  StarIcon,
  ArrowForwardIcon,
} from '@chakra-ui/icons';
import { NewFunnel, NewFunnelStep } from '../../types/';

interface CreateFunnelFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (funnel: NewFunnel) => void;
}

const CreateFunnelForm: React.FC<CreateFunnelFormProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<NewFunnelStep[]>([]);

  useEffect(() => {
    if (!isOpen) {
      // Clear the dialog state when it's closed
      setName('');
      setDescription('');
      setSteps([]);
    }
  }, [isOpen]);

  const handleAddStep = () => {
    setSteps([
      ...steps,
      {
        name: '',
        order: steps.length,
        definition: '',
        example: '',
        action: '',
      },
    ]);
  };

  const handleStepChange = (
    index: number,
    field: keyof NewFunnelStep,
    value: string
  ) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index > 0) ||
      (direction === 'down' && index < steps.length - 1)
    ) {
      const newSteps = [...steps];
      const temp = newSteps[index];
      newSteps[index] = newSteps[index + (direction === 'up' ? -1 : 1)];
      newSteps[index + (direction === 'up' ? -1 : 1)] = temp;
      newSteps.forEach((step, i) => (step.order = i));
      setSteps(newSteps);
    }
  };

  const handleDeleteStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    newSteps.forEach((step, i) => (step.order = i));
    setSteps(newSteps);
  };

  const handleSave = () => {
    const newFunnel: NewFunnel = {
      name,
      description,
      steps,
    };
    onSave(newFunnel);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='xl'>
      <ModalOverlay />
      <ModalContent maxWidth='800px'>
        <ModalHeader>Create New Funnel</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align='stretch'>
            <Input
              placeholder='Funnel Name'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Textarea
              placeholder='Funnel Description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Button leftIcon={<AddIcon />} onClick={handleAddStep}>
              Add Step
            </Button>
            <Accordion allowMultiple>
              {steps.map((step, index) => (
                <AccordionItem key={index}>
                  <h2>
                    <AccordionButton>
                      <Box flex='1' textAlign='left'>
                        {index + 1}. {step.name || 'Untitled Step'}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <VStack spacing={3} align='stretch'>
                      <Input
                        placeholder='Step Name'
                        value={step.name}
                        onChange={(e) =>
                          handleStepChange(index, 'name', e.target.value)
                        }
                      />
                      <HStack>
                        <InfoIcon />
                        <Text>Definition</Text>
                      </HStack>
                      <Textarea
                        placeholder='Step Definition'
                        value={step.definition}
                        onChange={(e) =>
                          handleStepChange(index, 'definition', e.target.value)
                        }
                      />
                      <HStack>
                        <StarIcon />
                        <Text>Example</Text>
                      </HStack>
                      <Textarea
                        placeholder='Step Example'
                        value={step.example}
                        onChange={(e) =>
                          handleStepChange(index, 'example', e.target.value)
                        }
                      />
                      <HStack>
                        <ArrowForwardIcon />
                        <Text>Action</Text>
                      </HStack>
                      <Textarea
                        placeholder='Step Action'
                        value={step.action}
                        onChange={(e) =>
                          handleStepChange(index, 'action', e.target.value)
                        }
                      />
                      <HStack justifyContent='space-between'>
                        <HStack>
                          <IconButton
                            aria-label='Move step up'
                            icon={<ChevronUpIcon />}
                            onClick={() => handleMoveStep(index, 'up')}
                            isDisabled={index === 0}
                          />
                          <IconButton
                            aria-label='Move step down'
                            icon={<ChevronDownIcon />}
                            onClick={() => handleMoveStep(index, 'down')}
                            isDisabled={index === steps.length - 1}
                          />
                        </HStack>
                        <IconButton
                          aria-label='Delete step'
                          icon={<DeleteIcon />}
                          onClick={() => handleDeleteStep(index)}
                          colorScheme='red'
                        />
                      </HStack>
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme='blue' mr={3} onClick={handleSave}>
            Save Funnel
          </Button>
          <Button variant='ghost' onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateFunnelForm;
