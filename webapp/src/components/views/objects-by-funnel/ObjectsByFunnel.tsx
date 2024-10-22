import React, { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  CloseButton,
  Flex,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import FunnelStep from './FunnelStep';
import { FunnelViewType } from 'src/api/funnel';
import { FaSave } from 'react-icons/fa';
import CreateListDialog from 'src/components/CreateListDialog';
import MarkdownDisplay from 'src/components/mardown/MarkdownDisplay';
import LoadingPanel from 'src/components/LoadingPanel';
import { FunnelStep as FunnelStepType } from 'src/types';
import { StepDetail } from 'src/components/forms/object/object-step/ObjectFunnelCard';
import { shortenText } from 'src/utils';

type ObjectsByFunnelProps = {
  funnelId: string;
  getFunnelView: any;
};

const ObjectsByFunnel: React.FC<ObjectsByFunnelProps> = ({
  funnelId,
  getFunnelView,
}: ObjectsByFunnelProps) => {
  const [funnelViewData, setFunnelViewData] = useState<FunnelViewType>();
  const [isLoading, setIsLoading] = useState(false);
  const {
    isOpen: isListOpen,
    onClose: onListClose,
    onOpen: onListOpen,
  } = useDisclosure();
  const {
    isOpen: isStepOpen,
    onClose: onStepClose,
    onOpen: onStepOpen,
  } = useDisclosure();
  const [selectedStep, setSelectedStep] = useState<FunnelStepType | null>(null);
  const toast = useToast();

  useEffect(() => {
    const initFunnelViewData = async () => {
      setIsLoading(true);
      try {
        setFunnelViewData(await getFunnelView(funnelId));
      } catch (e) {
        toast({
          title: 'Error',
          description: 'Failed to load funnel view',
          status: 'error',
          duration: 2000,
        });
      } finally {
        setIsLoading(false);
      }
    };
    initFunnelViewData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funnelId]);
  const funnel = funnelViewData?.funnel || {};
  const steps = funnelViewData?.steps || [];
  let total = 0;
  steps.forEach((s: any) => {
    total += s.objects?.length || 0;
  });
  let orderedSteps = steps.sort(
    (a, b) => a.step.step_order - b.step.step_order
  );
  return (
    <Box overflowX='auto'>
      <HStack>
        <HStack fontSize={'large'} fontWeight={'bold'}>
          <Text>{funnel.name}</Text> {total ? <Text>({total})</Text> : null}
        </HStack>
        {!isLoading && (
          <Button
            leftIcon={<FaSave />}
            size='sm'
            title='Save as a list'
            onClick={onListOpen}
          >
            Save As List
          </Button>
        )}
      </HStack>
      {isLoading ? (
        <LoadingPanel />
      ) : (
        <>
          <HStack spacing={2} mt={2}>
            {orderedSteps.map((orderedStep, k) => (
              <HStack key={k}>
                <Badge
                  colorScheme={k === orderedSteps.length - 1 ? 'green' : 'gray'}
                  _hover={{ cursor: 'pointer', background: 'yellow.100' }}
                  onClick={() => {
                    setSelectedStep(orderedStep.step);
                    onStepOpen();
                  }}
                >
                  {shortenText(orderedStep.step.name, 10)}
                </Badge>
                {k < orderedSteps.length - 1 && <Text>→</Text>}
              </HStack>
            ))}
          </HStack>

          {funnel.description && (
            <MarkdownDisplay
              content={funnel.description}
              characterLimit={200}
              style={{
                padding: '8px',
                border: '1px solid #eee',
                marginBottom: '12px',
                marginTop: '8px',
                backgroundColor: '#fff',
              }}
            />
          )}
          <HStack
            spacing={4}
            alignItems='flex-start'
            overflow={'scroll'}
            pl={2}
          >
            {steps.map((stepInfo) => (
              <FunnelStep
                key={stepInfo.step.id}
                step={stepInfo.step}
                objects={stepInfo.objects || []}
                onObjectMove={() => {}}
              />
            ))}
          </HStack>
        </>
      )}

      <CreateListDialog
        isOpen={isListOpen}
        onClose={onListClose}
        filterSetting={{
          funnelId: funnelId,
        }}
        onListCreated={() => {}}
      />
      <ModalObjectStep
        isOpen={isStepOpen}
        onClose={onStepClose}
        step={selectedStep as FunnelStepType}
      />
    </Box>
  );
};

type ModalObjectStepProps = {
  isOpen: boolean;
  step: FunnelStepType;
  onClose: () => void;
};

const ModalObjectStep = ({ isOpen, step, onClose }: ModalObjectStepProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size='full'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex>
            Step: {step?.name}
            <Spacer />
            <IconButton
              icon={<CloseButton />}
              onClick={onClose}
              aria-label='close'
              colorScheme='red'
              size='sm'
              variant={'ghost'}
            />
          </Flex>
        </ModalHeader>
        <ModalBody>
          <StepDetail step={step} defaultItem='action' />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ObjectsByFunnel;
