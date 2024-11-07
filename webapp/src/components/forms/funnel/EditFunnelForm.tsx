import React, { useState, useEffect, useCallback } from 'react';
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
  StepSeparator,
  Select,
  Tooltip,
  Alert,
  AlertIcon,
  Badge,
} from '@chakra-ui/react';
import {
  AddIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  DeleteIcon,
  WarningIcon,
  EditIcon,
} from '@chakra-ui/icons';
import { Funnel, FunnelStep, FunnelUpdate } from 'src/types';
import MarkdownEditor from 'src/components/mardown/MardownEditor';
import { useUnsavedChangesContext } from 'src/contexts/unsaved-changes/UnsavedChange';
import { RenderStepHeader } from './helper';

interface EditFunnelFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedFunnel: FunnelUpdate) => void;
  funnel?: Funnel;
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
  const setDefaultValue = (tmpFunnel: Funnel | undefined) => {
    if (tmpFunnel) {
      setName(tmpFunnel.name);
      setDescription(tmpFunnel.description);
      let tmpExistingSteps: FunnelStep[] = [],
        tmpNewSteps: FunnelStep[] = [];
      (tmpFunnel.steps || []).forEach((step) => {
        tmpExistingSteps.push(structuredClone(step));
        tmpNewSteps.push({ ...structuredClone(step), id: `new-${step.id}` });
      });
      setExistingSteps(tmpExistingSteps);
      setNewSteps(tmpNewSteps);
      setStepMapping(
        Object.fromEntries(
          (tmpFunnel.steps || []).map((step) => [step.id, `new-${step.id}`])
        )
      );
    }
  };
  const { isDirty, setDirty } = useUnsavedChangesContext();

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

  useEffect(() => {
    setDefaultValue(funnel);
  }, [funnel]);

  const handleAddStep = () => {
    setDirty(true);
    const newStep: FunnelStep = {
      id: `new-${Date.now()}`,
      name: '',
      step_order: newSteps.length,
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
    setDirty(true);
    const updatedSteps = [...newSteps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setNewSteps(updatedSteps);
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    setDirty(true);
    if (
      (direction === 'up' && index > 0) ||
      (direction === 'down' && index < newSteps.length - 1)
    ) {
      const updatedSteps = [...newSteps];
      const temp = updatedSteps[index];
      updatedSteps[index] = updatedSteps[index + (direction === 'up' ? -1 : 1)];
      updatedSteps[index + (direction === 'up' ? -1 : 1)] = temp;
      updatedSteps.forEach((step, i) => (step.step_order = i));
      setNewSteps(updatedSteps);
    }
  };

  const handleDeleteStep = (index: number) => {
    setDirty(true);
    const stepToDelete = newSteps[index];
    const updatedSteps = newSteps.filter((_, i) => i !== index);
    updatedSteps.forEach((step, i) => (step.step_order = i));
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
    setDirty(true);
    setStepMapping({ ...stepMapping, [oldStepId]: newStepId });
  };

  const handleSave = () => {
    let processedMapping: any = {};
    Object.keys(stepMapping).forEach((oldStepId) => {
      let newStepId = stepMapping[oldStepId];
      newStepId = existingSteps.some((existingStep) => {
        return existingStep.id === newStepId.replace('new-', '');
      })
        ? newStepId.replace('new-', '')
        : newStepId;
      processedMapping[oldStepId] = newStepId;
    });
    const editedFunnel: FunnelUpdate = {
      id: funnel!.id,
      name,
      description,
      steps_create: newSteps.filter(
        (step) =>
          !existingSteps.some(
            (existingStep) =>
              existingStep.id === step.id.toString().replace('new-', '')
          )
      ),
      steps_update: newSteps
        .filter(
          (step) =>
            step.id.toString().startsWith('new-') &&
            existingSteps.some(
              (existingStep) =>
                existingStep.id === step.id.toString().replace('new-', '')
            )
        )
        .map((step) => {
          return {
            ...step,
            id: step.id.replace('new-', ''),
          };
        }),
      steps_delete: existingSteps
        .filter(
          (step) =>
            !newSteps.some(
              (newStep) => step.id === newStep.id.toString().replace('new-', '')
            )
        )
        .map((step) => step.id.toString()),
      step_mapping: processedMapping,
    };
    onSave(editedFunnel);
    setDirty(false);
    onClose();
  };

  const isStepNameUnique = (name: string, currentIndex: number) => {
    return !newSteps.some(
      (step, index) => index !== currentIndex && step.name === name
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
        isReadOnly={!isNewStep}
        sx={{
          backgroundColor: !isNewStep ? 'gray.100' : 'white',
        }}
      />
      {RenderStepHeader({ type: 'defition' })}
      <MarkdownEditor
        initialValue={step.definition}
        onChange={(content: string) =>
          handleStepChange(index, 'definition', content)
        }
        filters={[]}
      />
      {RenderStepHeader({ type: 'example' })}
      <MarkdownEditor
        initialValue={step.example}
        onChange={(content: string) =>
          handleStepChange(index, 'example', content)
        }
        filters={[]}
      />
      {RenderStepHeader({ type: 'action' })}
      <MarkdownEditor
        initialValue={step.action}
        onChange={(content: string) =>
          handleStepChange(index, 'action', content)
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
    </VStack>
  );

  const renderPhase1 = () => (
    <VStack spacing={4} align='stretch'>
      <Button leftIcon={<AddIcon />} onClick={handleAddStep}>
        Add Step
      </Button>
      <Accordion allowToggle>
        {newSteps.map((step, index) => {
          const isNewStep = !existingSteps.some(
            (existingStep) => existingStep.id === step.id.replace('new-', '')
          );

          return (
            <AccordionItem key={step.id}>
              <h2>
                <AccordionButton>
                  <Box
                    flex='1'
                    textAlign='left'
                    sx={{ color: isNewStep ? 'blue' : 'grey' }}
                  >
                    {index + 1}. {step.name || 'Untitled Step'}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                {renderStepContent(step, index, isNewStep)}
              </AccordionPanel>
            </AccordionItem>
          );
        })}
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
              <HStack>
                <Box>
                  {index + 1}. {step.name}{' '}
                </Box>
                {!newSteps.some(
                  (newStep) => newStep.id.replace('new-', '') === step.id
                ) && <DeleteIcon color='red.500' />}
              </HStack>
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
        <Text fontWeight='bold' color='blue'>
          New Steps
        </Text>
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
      {existingSteps.map((step) => {
        const copyInNewStep = newSteps.find(
          (newStep) => newStep.id.replace('new-', '') === step.id
        );
        const action = copyInNewStep ? (
          <Badge colorScheme='blue'>
            <HStack>
              <EditIcon /> <Text>Edit</Text>
            </HStack>
          </Badge>
        ) : (
          <Badge colorScheme='red'>
            <HStack>
              <DeleteIcon /> <Text>Delete</Text>
            </HStack>
          </Badge>
        );
        const mappedNewStepId = stepMapping[step.id];
        const mappedNewStep = newSteps.find(
          (newStep) => newStep.id === mappedNewStepId
        );
        return (
          <Box key={step.id} p={2} borderWidth={1} borderRadius='md'>
            <Text sx={{ mr: '4px' }}>
              {action} {copyInNewStep ? copyInNewStep.step_order + 1 + '.' : ''}{' '}
              {step.name}
            </Text>
            {mappedNewStep &&
              mappedNewStep.id.replace('new-', '') === step.id &&
              ''}
            {mappedNewStep &&
              mappedNewStep.id.replace('new-', '') !== step.id && (
                <Text fontSize='sm' color='gray.500'>
                  Change object of this step to{' '}
                  <Badge color='blue'>{mappedNewStep.name}</Badge>
                </Text>
              )}
            {!mappedNewStep && (
              <Box>
                <WarningIcon color='red.500' /> Missing mapping to a new Step
              </Box>
            )}
          </Box>
        );
      })}
      {newSteps
        .filter(
          (step) =>
            !existingSteps
              .map((step) => {
                return 'new-' + step.id;
              })
              .includes(step.id)
        )
        .map((step) => {
          const mappedOldSteps = existingSteps.filter(
            (oldStep) => stepMapping[oldStep.id.toString()] === step.id
          );
          return (
            <Box key={step.id} p={2} borderWidth={1} borderRadius='md'>
              <Text sx={{ mr: '4px' }}>
                <Badge colorScheme='green'>
                  <HStack>
                    <AddIcon /> <Text>Create New</Text>
                  </HStack>
                </Badge>{' '}
                {step.step_order + 1 + '.'} {step.name}
              </Text>
              {mappedOldSteps.length > 0 && (
                <Text sx={{ mr: '4px' }}>
                  Mapped from:{' '}
                  {mappedOldSteps.map((oldStep) => (
                    <Badge key={oldStep.id}>{oldStep.name}</Badge>
                  ))}
                </Text>
              )}
            </Box>
          );
        })}
      {!isAllOldStepsMapped() && (
        <Alert status='warning'>
          <AlertIcon />
          Warning: Not all existing steps are mapped to new steps.
        </Alert>
      )}
      {createdStepHasOldName().length > 0 && (
        <Alert status='warning'>
          <AlertIcon />
          Warning: You cannot create a new step with an old step's name{' '}
          {createdStepHasOldName().map((name: string) => (
            <Badge key={name}>{name}</Badge>
          ))}
          .
        </Alert>
      )}
    </VStack>
  );

  const isAllOldStepsMapped = useCallback(
    function () {
      return existingSteps.every((step) =>
        Object.keys(stepMapping).includes(step.id.toString())
      );
    },
    [existingSteps, stepMapping]
  );

  const createdStepHasOldName = useCallback(
    function () {
      return newSteps
        .filter((newStep) =>
          existingSteps.some(
            (oldStep) =>
              newStep.name === oldStep.name &&
              newStep.id.replace('new-', '') !== oldStep.id
          )
        )
        .map((step) => step.name);
    },
    [existingSteps, newSteps]
  );

  const shouldSaveButtonDisabled = useCallback(() => {
    return (
      currentPhase !== 2 ||
      !isAllOldStepsMapped() ||
      createdStepHasOldName().length !== 0
    );
  }, [currentPhase, isAllOldStepsMapped, createdStepHasOldName]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setCurrentPhase(0);
        handleClose();
      }}
      size='xl'
    >
      <ModalOverlay />
      <ModalContent maxWidth='800px'>
        <ModalHeader>Edit Funnel</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align='stretch'>
            <Input
              placeholder='Funnel Name'
              value={name}
              onChange={(e) => {
                setDirty(true);
                setName(e.target.value);
              }}
            />
            <MarkdownEditor
              initialValue={description}
              onChange={(content: string) => {
                console.log('dirty');
                setDirty(true);
                setDescription(content);
              }}
              filters={[]}
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
            variant='ghost'
            mr={3}
            onClick={() => {
              if (isDirty) {
                const confirm = window.confirm(
                  'You have unsaved changes. Are you sure you want to reset?'
                );
                if (!confirm) {
                  return;
                }
              }
              setDefaultValue(funnel);
              setCurrentPhase(0);
            }}
          >
            Reset
          </Button>
          <Button variant='ghost' onClick={handleClose}>
            Cancel
          </Button>
          {shouldSaveButtonDisabled() ? (
            <Button
              colorScheme='blue'
              mr={3}
              onClick={() => {
                setCurrentPhase(currentPhase + 1);
              }}
            >
              Move to {currentPhase === 0 ? 'Map Steps' : 'Preview Changes'}
            </Button>
          ) : (
            <Button
              colorScheme='blue'
              mr={3}
              onClick={handleSave}
              isDisabled={shouldSaveButtonDisabled()}
            >
              Save Changes
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditFunnelForm;
