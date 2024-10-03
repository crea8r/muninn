// ObjectTypeCard.tsx
import React from 'react';
import {
  Box,
  Text,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Select,
  useToast,
  Tab,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Badge,
  IconButton,
  Spacer,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { Funnel, FunnelStep, StepAndFunnel } from 'src/types/';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { shortenText, substatus } from 'src/utils';
import { DeleteIcon } from '@chakra-ui/icons';

interface ObjectFunnelCardProps {
  currentObjectStepFunnel: StepAndFunnel;
  historySteps: StepAndFunnel[];
  funnel: Funnel;
  currentStep: FunnelStep;
  onMoveInFunnel: (stepId: string) => void;
  onDelete: () => void;
  onUpdateSubStatus: (objectStepId: string, subStatus: number) => void;
  showComplete?: boolean;
}

const HistoryItems = ({
  historySteps,
  currentStep,
}: {
  historySteps: StepAndFunnel[];
  currentStep: FunnelStep;
}) => {
  return (
    <VStack spacing={4} align='stretch'>
      {historySteps
        .sort((a, b) => {
          return dayjs(a.createdAt).isBefore(dayjs(b.createdAt)) ? -1 : 1;
        })
        .map((step) => {
          return (
            <Box key={step.id}>
              <Text>
                {step.subStatus === 2 ? (
                  <Text colorScheme='red'>substatus(step.subStatus)</Text>
                ) : (
                  substatus(step.subStatus)
                )}{' '}
                <Badge
                  colorScheme={
                    step.stepId === currentStep.id && !step.deletedAt
                      ? 'green'
                      : 'gray'
                  }
                >
                  {step.stepName}
                </Badge>{' '}
                at {dayjs(step.createdAt).fromNow()}
              </Text>
            </Box>
          );
        })}
    </VStack>
  );
};

const StepDetail = ({ step }: { step: FunnelStep }) => {
  return (
    <Box padding={1} border={1} borderColor='gray.200'>
      <Box>Defition: {step.definition}</Box>
      <Box>Example: {step.example}</Box>
      <Box>Action: {step.action}</Box>
    </Box>
  );
};

const ObjectFunnelCard: React.FC<ObjectFunnelCardProps> = ({
  currentObjectStepFunnel,
  funnel,
  currentStep,
  onMoveInFunnel,
  onDelete,
  showComplete = false,
  historySteps,
  onUpdateSubStatus,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedStepId, setSelectedStepId] = React.useState(currentStep.id);
  const isLastStep =
    funnel.steps[funnel.steps.length - 1].id === currentStep.id;
  const handleReset = () => {
    setSelectedStepId(currentStep.id);
  };
  const toast = useToast();
  if (isLastStep && !showComplete) {
    return null;
  }
  const nextStep = funnel.steps.find(
    (step: FunnelStep) => step.step_order === currentStep.step_order + 1
  );
  const tmpStep = funnel.steps.find(
    (step: FunnelStep) => step.id === selectedStepId
  );
  dayjs.extend(relativeTime);
  const subStatus = currentObjectStepFunnel.subStatus;
  const subStatusBadgeColor =
    subStatus === 0 ? 'gray' : subStatus === 1 ? 'green' : 'red';
  const subStatusText = substatus(subStatus);
  const handleUpdateToStep = async () => {
    try {
      await onMoveInFunnel(selectedStepId);
      onClose();
      toast({
        title: 'Success',
        description: 'Step updated',
        status: 'success',
        duration: 9000,
        isClosable: true,
      });
    } catch (e) {
      toast({
        title: 'Error',
        description: "Can't update step",
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  };
  const handleDeleteFromFunnel = async () => {
    try {
      await onDelete();
      onClose();
      toast({
        title: 'Success',
        description: 'Step removed from funnel',
        status: 'success',
        duration: 9000,
        isClosable: true,
      });
    } catch (e) {
      toast({
        title: 'Error',
        description: "Can't delete step",
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  };
  const handleUpdateSubStatus = async (subStatus: number) => {
    try {
      await onUpdateSubStatus(currentObjectStepFunnel.id, subStatus);
      toast({
        title: 'Success',
        description: 'Substatus updated',
        status: 'success',
        duration: 9000,
        isClosable: true,
      });
    } catch (e) {
      toast({
        title: 'Error',
        description: "Can't update substatus",
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    } finally {
      onClose();
    }
  };
  return (
    <>
      <Box
        key={currentObjectStepFunnel.funnelId}
        borderWidth={1}
        borderRadius='md'
        p={4}
        onClick={onOpen}
        cursor='pointer'
      >
        <HStack alignItems={'center'} w={'100%'} mb={2}>
          <Text size='sm' fontWeight={'bold'}>
            {funnel.name}
          </Text>
          <Spacer />
          <Text size={'sm'}>
            {dayjs(currentObjectStepFunnel.createdAt).fromNow()}
          </Text>
        </HStack>
        <HStack alignItems={'center'} w={'100%'}>
          <Text>Current Step: {currentStep.name}</Text>
          <Badge colorScheme={subStatusBadgeColor}>{subStatusText}</Badge>
        </HStack>

        {isLastStep && (
          <Text color='green.500' fontWeight='bold'>
            Completed
          </Text>
        )}
        {!isLastStep && nextStep && subStatus !== 2 && (
          <Text>Next Step: {nextStep.name}</Text>
        )}
        {funnel.steps.find((step) => step.step_order === currentStep.step_order)
          ?.action && (
          <Alert status='warning' mt={2}>
            <AlertIcon />
            {shortenText(
              funnel.steps.find(
                (step) => step.step_order === currentStep.step_order
              )?.action || '',
              50
            )}
          </Alert>
        )}
      </Box>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          handleReset();
          onClose();
        }}
        size='xl'
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack w={'100%'}>
              <Text>Step Detail</Text>
              <Spacer />
              <IconButton
                size={'sm'}
                aria-label='Delete From Funnel'
                icon={<DeleteIcon />}
                colorScheme='red'
                onClick={handleDeleteFromFunnel}
              />
            </HStack>
          </ModalHeader>
          <ModalBody>
            <Tabs>
              <TabList>
                <Tab>Update Steps</Tab>
                <Tab>History</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <VStack spacing={4} align='stretch'>
                    <Box mt={2}>
                      <FormLabel>
                        Current Step: {currentStep.step_order}.{' '}
                        {currentStep.name}{' '}
                        <Badge colorScheme={subStatusBadgeColor}>
                          {subStatusText}
                        </Badge>
                      </FormLabel>
                      <StepDetail step={currentStep} />
                    </Box>
                    {subStatus === 1 && (
                      <FormControl mt={2}>
                        <FormLabel>Move to</FormLabel>
                        <Select
                          value={selectedStepId}
                          onChange={(e) => setSelectedStepId(e.target.value)}
                        >
                          {funnel.steps.map((step: FunnelStep) => (
                            <option key={step.id} value={step.id}>
                              {step.step_order}. {step.name}
                            </option>
                          ))}
                        </Select>
                        {selectedStepId !== currentStep.id && tmpStep && (
                          <StepDetail step={tmpStep} />
                        )}
                      </FormControl>
                    )}
                  </VStack>
                </TabPanel>
                <TabPanel>
                  <HistoryItems
                    historySteps={historySteps}
                    currentStep={currentStep}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
          <ModalFooter>
            <HStack w={'100%'}>
              <Spacer />
              {[0, 2].includes(subStatus) && (
                <Button
                  colorScheme='blue'
                  onClick={() => {
                    handleUpdateSubStatus(1);
                  }}
                >
                  Proceed this contact
                </Button>
              )}
              {subStatus === 1 && (
                <>
                  <Button
                    colorScheme='red'
                    onClick={() => {
                      handleUpdateSubStatus(2);
                    }}
                  >
                    Drop out this contact
                  </Button>
                  <Button
                    colorScheme='blue'
                    onClick={handleUpdateToStep}
                    isDisabled={selectedStepId === currentStep.id}
                  >
                    Update
                  </Button>
                </>
              )}
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ObjectFunnelCard;
