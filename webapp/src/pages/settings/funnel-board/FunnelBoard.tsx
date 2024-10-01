import React, { useEffect, useState } from 'react';
import { Alert, Badge, Box, Heading, HStack, Text } from '@chakra-ui/react';
import FunnelStep from './FunnelStep';
import { mockObjectsInSteps } from './mockData';
import BreadcrumbComponent from 'src/components/Breadcrumb';
import { FunnelViewType, getFunnelView } from 'src/api/funnel';
import { useParams } from 'react-router-dom';
import { Header } from 'src/components/layout';

const FunnelBoard: React.FC = () => {
  const [objectsInSteps, setObjectsInSteps] = useState(mockObjectsInSteps);
  const { funnelId } = useParams<{ funnelId: string }>();
  const [funnelViewData, setFunnelViewData] = useState<FunnelViewType>();
  const [forceUpdate, setForceUpdate] = useState(0);

  const handleObjectMove = (objectId: string, newStepId: string) => {
    setObjectsInSteps((prevState) => {
      const updatedState = { ...prevState };
      // Remove the object from its current step
      Object.keys(updatedState).forEach((stepId) => {
        updatedState[stepId] = updatedState[stepId].filter(
          (obj) => obj.id !== objectId
        );
      });
      // Add the object to the new step
      const movedObject = Object.values(prevState)
        .flat()
        .find((obj) => obj.id === objectId);
      if (movedObject) {
        updatedState[newStepId] = [
          ...(updatedState[newStepId] || []),
          movedObject,
        ];
      }
      return updatedState;
    });
  };

  useEffect(() => {
    const initFunnelViewData = async () => {
      try {
        setFunnelViewData(await getFunnelView(funnelId));
      } catch (e) {
        console.error(e);
      }
    };
    initFunnelViewData();
  }, [forceUpdate, funnelId]);
  const funnel = funnelViewData?.funnel || {};
  const steps = funnelViewData?.steps || [];
  let total = 0;
  steps.forEach((s: any) => {
    total += s.objects?.length || 0;
  });
  let stepNames = steps
    .sort((a, b) => a.step.order - b.step.order)
    .map((step) => {
      return step.step.name;
    });
  return (
    <Box overflowX='auto' p={4}>
      <BreadcrumbComponent label={funnel.name} />
      <Text fontSize={'large'} fontWeight={'bold'}>
        {funnel.name} ({total})
      </Text>
      <HStack spacing={2} mt={2}>
        {stepNames.map((stepName, k) => (
          <>
            <Badge colorScheme={k === stepNames.length - 1 ? 'green' : 'gray'}>
              {stepName}
            </Badge>
            {k < stepNames.length - 1 && <Text>→</Text>}
          </>
        ))}
      </HStack>

      <Alert my={2}>{funnel.description}</Alert>
      <HStack spacing={4} alignItems='flex-start' overflow={'scroll'} pl={2}>
        {steps.map((stepInfo) => (
          <FunnelStep
            key={stepInfo.step.id}
            step={stepInfo.step}
            objects={stepInfo.objects || []}
            onObjectMove={handleObjectMove}
          />
        ))}
      </HStack>
    </Box>
  );
};

export default FunnelBoard;
