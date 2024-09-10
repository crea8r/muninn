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
  HStack,
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
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
  Select,
  Tooltip,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import {
  AddIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  DeleteIcon,
  InfoIcon,
  StarIcon,
  ArrowForwardIcon,
  WarningIcon,
} from '@chakra-ui/icons';
import { Funnel, FunnelStep } from '../../types/';

interface EditFunnelFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedFunnel: EditedFunnel) => void;
  funnel?: Funnel;
}

interface EditedFunnel {
  id: any;
  name: string;
  description: string;
  steps: {
    create: FunnelStep[];
    update: FunnelStep[];
    delete: string[];
  };
}

// TODO: In Redesign Steps phase
// - add validation to ensure step names are unique and not empty
// - initial step's name is not editable
const EditFunnelForm: React.FC<EditFunnelFormProps> = ({
  isOpen,
  onClose,
  onSave,
  funnel,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [existingSteps, setExistingSteps] = useState<FunnelStep[]>([]);
  const [newSteps, setNewSteps] = useState<FunnelStep[]>([]);
  const [stepMapping, setStepMapping] = useState<{ [oldId: string]: string }>(
    {}
  );
  const [currentPhase, setCurrentPhase] = useState(0);

  useEffect(() => {
    if (funnel) {
      setName(funnel.name);
      setDescription(funnel.description);
      setExistingSteps(funnel.steps);
      setNewSteps(
        funnel.steps.map((step) => ({ ...step, id: `new-${step.id}` }))
      );
      setStepMapping(
        Object.fromEntries(
          funnel.steps.map((step) => [step.id, `new-${step.id}`])
        )
      );
    }
  }, [funnel]);

  const handleAddStep = () => {
    const newStep: FunnelStep = {
      id: `new-${Date.now()}`,
      name: '',
      order: newSteps.length,
      definition: '',
      example: '',
      action: '',
    };
    setNewSteps([...newSteps, newStep]);
  };

  const handleStepChange = (
    index: number,
    field: keyof FunnelStep,
    value: string
  ) => {
    const updatedSteps = [...newSteps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setNewSteps(updatedSteps);
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index > 0) ||
      (direction === 'down' && index < newSteps.length - 1)
    ) {
      const updatedSteps = [...newSteps];
      const temp = updatedSteps[index];
      updatedSteps[index] = updatedSteps[index + (direction === 'up' ? -1 : 1)];
      updatedSteps[index + (direction === 'up' ? -1 : 1)] = temp;
      updatedSteps.forEach((step, i) => (step.order = i));
      setNewSteps(updatedSteps);
    }
  };

  const handleDeleteStep = (index: number) => {
    const stepToDelete = newSteps[index];
    const updatedSteps = newSteps.filter((_, i) => i !== index);
    updatedSteps.forEach((step, i) => (step.order = i));
    setNewSteps(updatedSteps);

    // Remove mapping for deleted step
    const updatedMapping = { ...stepMapping };
    Object.keys(updatedMapping).forEach((key) => {
      if (updatedMapping[key] === stepToDelete.id) {
        delete updatedMapping[key];
      }
    });
    setStepMapping(updatedMapping);
  };

  const handleStepMapping = (oldStepId: string, newStepId: string) => {
    setStepMapping({ ...stepMapping, [oldStepId]: newStepId });
  };

  const handleSave = () => {
    const editedFunnel: EditedFunnel = {
      id: funnel!.id,
      name,
      description,
      steps: {
        create: newSteps.filter(
          (step) => !step.id.toString().startsWith('new-')
        ),
        update: newSteps.filter(
          (step) =>
            step.id.toString().startsWith('new-') &&
            existingSteps.some(
              (existingStep) =>
                existingStep.id === step.id.toString().replace('new-', '')
            )
        ),
        delete: existingSteps
          .filter(
            (step) => !Object.values(stepMapping).includes(`new-${step.id}`)
          )
          .map((step) => step.id.toString()),
      },
    };
    onSave(editedFunnel);
    onClose();
  };

  const isStepNameUnique = (name: string, currentIndex: number) => {
    return !newSteps.some(
      (step, index) => index !== currentIndex && step.name === name
    );
  };

  const isAllOldStepsMapped = () => {
    return existingSteps.every((step) =>
      Object.keys(stepMapping).includes(step.id.toString())
    );
  };

  const renderStepContent = (
    step: FunnelStep,
    index: number,
    isNewStep: boolean = true
  ) => (
    <VStack spacing={3} align='stretch'>
      <Input
        placeholder='Step Name'
        value={step.name}
        onChange={(e) => handleStepChange(index, 'name', e.target.value)}
        isInvalid={!isStepNameUnique(step.name, index)}
        isReadOnly={
          !isNewStep &&
          existingSteps.some((existingStep) => existingStep.name === step.name)
        }
      />
      <HStack>
        <InfoIcon />
        <Text>Definition</Text>
      </HStack>
      <Textarea
        placeholder='Step Definition'
        value={step.definition}
        onChange={(e) => handleStepChange(index, 'definition', e.target.value)}
      />
      <HStack>
        <StarIcon />
        <Text>Example</Text>
      </HStack>
      <Textarea
        placeholder='Step Example'
        value={step.example}
        onChange={(e) => handleStepChange(index, 'example', e.target.value)}
      />
      <HStack>
        <ArrowForwardIcon />
        <Text>Action</Text>
      </HStack>
      <Textarea
        placeholder='Step Action'
        value={step.action}
        onChange={(e) => handleStepChange(index, 'action', e.target.value)}
      />
      {isNewStep && (
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
              isDisabled={index === newSteps.length - 1}
            />
          </HStack>
          <IconButton
            aria-label='Delete step'
            icon={<DeleteIcon />}
            onClick={() => handleDeleteStep(index)}
            colorScheme='red'
          />
        </HStack>
      )}
    </VStack>
  );

  const renderPhase1 = () => (
    <VStack spacing={4} align='stretch'>
      <Button leftIcon={<AddIcon />} onClick={handleAddStep}>
        Add Step
      </Button>
      <Accordion allowMultiple>
        {newSteps.map((step, index) => (
          <AccordionItem key={step.id}>
            <h2>
              <AccordionButton>
                <Box flex='1' textAlign='left'>
                  {index + 1}. {step.name || 'Untitled Step'}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              {renderStepContent(step, index)}
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </VStack>
  );

  const renderPhase2 = () => (
    <HStack align='flex-start' spacing={8}>
      <VStack flex={1} align='stretch'>
        <Text fontWeight='bold'>Existing Steps</Text>
        {existingSteps.map((step, index) => (
          <Tooltip
            key={step.id}
            label={`Definition: ${step.definition}\nExample: ${step.example}\nAction: ${step.action}`}
          >
            <Box>
              <Text>
                {index + 1}. {step.name}
              </Text>
              <Select
                placeholder='Map to new step'
                value={stepMapping[step.id.toString()] || ''}
                onChange={(e) =>
                  handleStepMapping(step.id.toString(), e.target.value)
                }
              >
                {newSteps.map((newStep) => (
                  <option key={newStep.id} value={newStep.id.toString()}>
                    {newStep.name}
                  </option>
                ))}
              </Select>
            </Box>
          </Tooltip>
        ))}
      </VStack>
      <VStack flex={1} align='stretch'>
        <Text fontWeight='bold'>New Steps</Text>
        {newSteps.map((step, index) => (
          <Tooltip
            key={step.id}
            label={`Definition: ${step.definition}\nExample: ${step.example}\nAction: ${step.action}`}
          >
            <Text>
              {index + 1}. {step.name}
            </Text>
          </Tooltip>
        ))}
      </VStack>
    </HStack>
  );

  const renderPhase3 = () => (
    <VStack spacing={4} align='stretch'>
      <Text fontWeight='bold'>Preview of Changes</Text>
      {newSteps.map((step, index) => {
        const oldStep = existingSteps.find(
          (oldStep) => `new-${oldStep.id}` === step.id
        );
        const action = oldStep ? 'Edit' : 'Create';
        return (
          <Box key={step.id} p={2} borderWidth={1} borderRadius='md'>
            <Text>
              {index + 1}. {step.name} - {action}
            </Text>
            {oldStep && (
              <Text fontSize='sm' color='gray.500'>
                Mapped from: {oldStep.name}
              </Text>
            )}
          </Box>
        );
      })}
      {existingSteps
        .filter(
          (step) => !Object.values(stepMapping).includes(`new-${step.id}`)
        )
        .map((step) => (
          <Box
            key={step.id}
            p={2}
            borderWidth={1}
            borderRadius='md'
            bg='red.100'
          >
            <Text>{step.name} - Delete</Text>
          </Box>
        ))}
      {!isAllOldStepsMapped() && (
        <Alert status='warning'>
          <AlertIcon />
          Warning: Not all existing steps are mapped to new steps.
        </Alert>
      )}
    </VStack>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='xl'>
      <ModalOverlay />
      <ModalContent maxWidth='800px'>
        <ModalHeader>Edit Funnel</ModalHeader>
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
            <Stepper index={currentPhase}>
              {['Redesign Steps', 'Map Steps', 'Preview Changes'].map(
                (title, index) => (
                  <Step key={index} onClick={() => setCurrentPhase(index)}>
                    <StepIndicator>
                      <StepStatus
                        complete={<StepIcon />}
                        incomplete={<StepNumber />}
                        active={<StepNumber />}
                      />
                    </StepIndicator>
                    <Box flexShrink='0'>
                      <StepTitle>{title}</StepTitle>
                    </Box>
                    <StepSeparator />
                  </Step>
                )
              )}
            </Stepper>
            {currentPhase === 0 && renderPhase1()}
            {currentPhase === 1 && renderPhase2()}
            {currentPhase === 2 && renderPhase3()}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme='blue'
            mr={3}
            onClick={handleSave}
            isDisabled={currentPhase !== 2 || !isAllOldStepsMapped()}
          >
            Save Changes
          </Button>
          <Button variant='ghost' onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditFunnelForm;
