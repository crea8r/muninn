// ObjectTypeCard.tsx
import React, { useState } from 'react';
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
  Flex,
  Divider,
} from '@chakra-ui/react';
import { Funnel, FunnelStep, StepAndFunnel } from 'src/types/';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { shortenText, substatus } from 'src/utils';
import { ChevronDownIcon, ChevronUpIcon, CloseIcon } from '@chakra-ui/icons';
import MarkdownDisplay from 'src/components/mardown/MarkdownDisplay';

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

export const StepDetail = ({
  step,
  defaultItem = '',
}: {
  step: FunnelStep;
  defaultItem?: string;
}) => {
  const [showingItem, setShowingItem] = useState<string>(defaultItem);
  const renderItem = (item: string, label: string) => {
    const content = step[item as keyof FunnelStep];
    return (
      <VStack spacing={2} alignItems={'flex-start'} py={1}>
        <Flex alignItems={'center'}>
          <IconButton
            onClick={() => {
              setShowingItem(showingItem === item ? '' : item);
            }}
            icon={
              showingItem === item ? <ChevronDownIcon /> : <ChevronUpIcon />
            }
            aria-label={label}
            size='xs'
            mr={1}
          />

          <Text fontWeight={'bold'}>{label}:</Text>
        </Flex>

        {content && showingItem === item && (
          <>
            <Divider />
            <MarkdownDisplay
              content={content.toString()}
              characterLimit={200}
            />
          </>
        )}
      </VStack>
    );
  };
  return (
    <Box padding={1} border={1} borderColor='gray.200'>
      {renderItem('definition', 'Definition')}
      {renderItem('example', 'Example')}
      {renderItem('action', 'Action')}
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
      >
        <HStack alignItems={'center'} w={'100%'} mb={2}>
          <Text
            size='sm'
            fontWeight={'bold'}
            textDecoration={'underline'}
            onClick={onOpen}
            cursor='pointer'
          >
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
          <Box mt={2}>
            <MarkdownDisplay
              content={shortenText(
                funnel.steps.find(
                  (step) => step.step_order === currentStep.step_order
                )?.action || '',
                50
              )}
            />
          </Box>
        )}
      </Box>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          handleReset();
          onClose();
        }}
        size='full'
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack w={'100%'}>
              <Text>Step Detail</Text>
              <Spacer />
              <IconButton
                variant={'outline'}
                size={'sm'}
                aria-label='Close'
                icon={<CloseIcon />}
                colorScheme='red'
                onClick={onClose}
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
                      <StepDetail step={currentStep} defaultItem='action' />
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
                          <StepDetail step={tmpStep} defaultItem='definition' />
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
              <Button
                size={'md'}
                aria-label='Delete From Funnel'
                colorScheme='red'
                onClick={handleDeleteFromFunnel}
              >
                Delete From Funnel
              </Button>
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
                    variant={'outline'}
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
