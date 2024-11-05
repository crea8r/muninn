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
import { NewFunnel, NewFunnelStep } from 'src/types';
import MarkdownEditor from 'src/components/mardown/MardownEditor';
import { useUnsavedChangesContext } from 'src/contexts/unsaved-changes/UnsavedChange';

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
  const { isDirty, setDirty } = useUnsavedChangesContext();

  useEffect(() => {
    if (!isOpen) {
      // Clear the dialog state when it's closed
      setName('');
      setDescription('');
      setSteps([]);
    }
  }, [isOpen]);

  const handleAddStep = () => {
    setDirty(true);
    setSteps([
      ...steps,
      {
        name: '',
        step_order: steps.length,
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
    setDirty(true);
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    setDirty(true);
    if (
      (direction === 'up' && index > 0) ||
      (direction === 'down' && index < steps.length - 1)
    ) {
      const newSteps = [...steps];
      const temp = newSteps[index];
      newSteps[index] = newSteps[index + (direction === 'up' ? -1 : 1)];
      newSteps[index + (direction === 'up' ? -1 : 1)] = temp;
      newSteps.forEach((step, i) => (step.step_order = i));
      setSteps(newSteps);
    }
  };

  const handleDeleteStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    newSteps.forEach((step, i) => (step.step_order = i));
    setSteps(newSteps);
  };

  const handleClose = () => {
    if (isDirty) {
      const confirm = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirm) {
        return;
      }
    }
    onClose();
    setDirty(false);
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
    <Modal isOpen={isOpen} onClose={handleClose} size='xl'>
      <ModalOverlay />
      <ModalContent maxWidth='800px'>
        <ModalHeader>Create New Funnel</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align='stretch'>
            <Input
              placeholder='Funnel Name'
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setDirty(true);
              }}
            />
            <MarkdownEditor
              initialValue={description}
              onChange={(content: string) => {
                setDirty(true);
                setDescription(content);
              }}
              filters={[]}
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
                      <MarkdownEditor
                        initialValue={step.definition}
                        onChange={(content: string) =>
                          handleStepChange(index, 'definition', content)
                        }
                        filters={[]}
                      />
                      <HStack>
                        <StarIcon />
                        <Text>Example</Text>
                      </HStack>
                      <MarkdownEditor
                        initialValue={step.example}
                        onChange={(c: string) =>
                          handleStepChange(index, 'example', c)
                        }
                        filters={[]}
                      />
                      <HStack>
                        <ArrowForwardIcon />
                        <Text>Action</Text>
                      </HStack>
                      <MarkdownEditor
                        initialValue={step.action}
                        onChange={(c: string) =>
                          handleStepChange(index, 'action', c)
                        }
                        filters={[]}
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
          <Button variant='ghost' onClick={handleClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateFunnelForm;
