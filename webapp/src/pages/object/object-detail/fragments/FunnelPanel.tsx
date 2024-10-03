import React, { useState, useEffect } from 'react';
import {
  VStack,
  Button,
  useToast,
  Switch,
  FormControl,
  FormLabel,
  useDisclosure,
  SimpleGrid,
  HStack,
  Spacer,
  Text,
} from '@chakra-ui/react';
import { Funnel, FunnelStep } from 'src/types/';
import { fetchAllFunnels } from 'src/api/funnel';
import { StepAndFunnel } from 'src/types/Object';
import AddObjectStepModal from 'src/components/forms/object/object-step/AddObjectStepModal';
import ObjectFunnelCard from 'src/components/forms/object/object-step/ObjectFunnelCard';
import { FaPlus } from 'react-icons/fa';

interface FunnelPanelProps {
  objectId: string;
  onAddOrMoveObjectInFunnel: (objectId: string, stepId: string) => void;
  onDeleteObjectFromFunnel: (objectStepId: string) => void;
  stepsAndFunnels: StepAndFunnel[];
  onUpdateSubStatus: (objectStepId: string, subStatus: number) => void;
}

const FunnelPanel: React.FC<FunnelPanelProps> = ({
  objectId,
  onAddOrMoveObjectInFunnel,
  onDeleteObjectFromFunnel,
  onUpdateSubStatus,
  stepsAndFunnels,
}) => {
  const [allFunnels, setAllFunnels] = useState<Funnel[]>([]);
  const [showComplete, setShowComplete] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  useEffect(() => {
    const loadFunnels = async () => {
      try {
        const allFunnelsData = await fetchAllFunnels();
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

  const handleSubmit = async (stepId: string, isNew: boolean) => {
    const successTitle = isNew
      ? 'Object added to new funnel'
      : 'Object moved to new step';
    const errorTitle = isNew
      ? 'Error adding object to new funnel'
      : 'Error moving object to new step';
    try {
      await onAddOrMoveObjectInFunnel(objectId, stepId);
      onClose();
      toast({
        title: successTitle,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: errorTitle,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <VStack width={'100%'} align='stretch' spacing={4}>
        <HStack width={'100%'} alignItems={'center'}>
          <Button size={'sm'} aria-label='Add funnel' onClick={onOpen}>
            <FaPlus />
            <Text ml={1}>Funnel</Text>
          </Button>
          <Spacer />
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
                    await onDeleteObjectFromFunnel(currentObjectStepFunnel.id);
                  }}
                  onUpdateSubStatus={onUpdateSubStatus}
                />
              );
            })}
        </SimpleGrid>
      </VStack>
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

export default FunnelPanel;
