import React, { useState } from 'react';
import {
  VStack,
  useToast,
  Switch,
  FormControl,
  FormLabel,
  useDisclosure,
  SimpleGrid,
  HStack,
} from '@chakra-ui/react';
import { FunnelStep } from 'src/types/';
import { StepAndFunnel } from 'src/types/Object';
import AddObjectStepModal from 'src/components/forms/object/object-step/AddObjectStepModal';
import ObjectFunnelCard from 'src/components/forms/object/object-step/ObjectFunnelCard';
import { FaPlus } from 'react-icons/fa';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import {
  addOrMoveObjectInFunnel,
  deleteObjectFromFunnel,
  updateObjectStepSubStatus,
} from 'src/api';
import { useObjectDetail } from '../contexts/ObjectDetailContext';

export const FunnelPanel: React.FC = () => {
  const { globalData } = useGlobalContext();
  const allFunnels = globalData?.funnelData?.funnels || [];
  const [showComplete, setShowComplete] = useState(false);

  const toast = useToast();
  const { object, refresh } = useObjectDetail();
  const stepsAndFunnels = object?.stepsAndFunnels || [];
  const objectId = object?.id;
  const handleSubmit = async (stepId: string, isNew: boolean) => {
    const successTitle = isNew
      ? 'Object added to new funnel'
      : 'Object moved to new step';
    const errorTitle = isNew
      ? 'Error adding object to new funnel'
      : 'Error moving object to new step';
    toast({
      title: 'Processing...',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    try {
      await addOrMoveObjectInFunnel(objectId, stepId);
      toast({
        title: successTitle,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refresh();
    } catch (error) {
      toast({
        title: errorTitle,
        status: 'error',
        description:
          typeof error === 'string' ? error : 'Please try again later.',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <VStack width={'100%'} align='stretch' spacing={4}>
        <HStack width={'100%'} alignItems={'center'}>
          <FormControl display='flex' alignItems='center'>
            <FormLabel htmlFor='show-hidden' mb='0'>
              Completed Funnels
            </FormLabel>
            <Switch
              size={'sm'}
              id='show-hidden'
              onChange={(e) => setShowComplete(e.target.checked)}
            />
          </FormControl>
        </HStack>
        <SimpleGrid columns={[1, 2]} spacing={4}>
          {stepsAndFunnels
            .filter((sf: StepAndFunnel) => sf.deletedAt === null)
            .map((currentObjectStepFunnel) => {
              const funnel = allFunnels.find(
                (f) => f.id === currentObjectStepFunnel.funnelId
              );
              if (!funnel) return null;
              const currentStep = funnel.steps.find(
                (step: FunnelStep) => step.id === currentObjectStepFunnel.stepId
              );
              const historySteps = stepsAndFunnels.filter(
                (sf) => sf.funnelId === currentObjectStepFunnel.funnelId
              );
              if (!currentStep) return null;

              return (
                <ObjectFunnelCard
                  key={currentObjectStepFunnel.funnelId}
                  currentObjectStepFunnel={currentObjectStepFunnel}
                  funnel={funnel}
                  currentStep={currentStep}
                  showComplete={showComplete}
                  historySteps={historySteps}
                  onMoveInFunnel={(stepId) => {
                    handleSubmit(stepId, false);
                  }}
                  onDelete={async () => {
                    deleteObjectFromFunnel(currentObjectStepFunnel.id);
                    refresh();
                  }}
                  onUpdateSubStatus={async (
                    objectStepId: string,
                    subStatus: number
                  ) => {
                    updateObjectStepSubStatus(objectStepId, subStatus);
                    refresh();
                  }}
                />
              );
            })}
        </SimpleGrid>
      </VStack>
    </>
  );
};

export const CreateFunnelStepButton: React.FC = () => {
  const { globalData } = useGlobalContext();
  const { object, refresh } = useObjectDetail();
  const stepsAndFunnels = object?.stepsAndFunnels || [];
  const allFunnels = globalData?.funnelData?.funnels || [];
  const { isOpen, onOpen, onClose } = useDisclosure();
  const objectId = object?.id;
  const toast = useToast();
  const handleSubmit = async (stepId: string, isNew: boolean) => {
    toast({
      title: 'Processing...',
      status: 'info',
      duration: 1000,
      isClosable: true,
    });
    try {
      await addOrMoveObjectInFunnel(objectId, stepId);
      toast({
        title: 'Object added to new funnel',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refresh();
    } catch (error) {
      toast({
        title: 'Error adding object to new funnel',
        status: 'error',
        description:
          typeof error === 'string' ? error : 'Please try again later.',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  return (
    <>
      <FaPlus onClick={onOpen} />
      <AddObjectStepModal
        isOpen={isOpen}
        onClose={onClose}
        availableFunnels={allFunnels}
        stepsAndFunnels={stepsAndFunnels}
        onAddToFunnel={(stepId: string) => {
          handleSubmit(stepId, true);
        }}
      />
    </>
  );
};
