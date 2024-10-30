// MergeObjectsPage.tsx
import React, { useState } from 'react';
import {
  Box,
  HStack,
  Button,
  useSteps,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  Stepper,
  useToast,
  Heading,
} from '@chakra-ui/react';
import { Object } from 'src/types';
import ObjectSelectionStep from './steps/ObjectSelectionStep';
import MergeRuleStep from './steps/MergeRuleStep';
import MergePreviewStep from './steps/MergePreviewStep';
import BreadcrumbComponent from '../../components/Breadcrumb';

interface MergeRules {
  nameSource: 'source' | 'target' | 'custom';
  descriptionSource: 'source' | 'target' | 'custom';
  customName: string;
  customDescription: string;
  typeValueRules: Record<string, 'source' | 'target'>;
}

const steps = [
  { title: 'Select Objects', description: 'Choose objects to merge' },
  { title: 'Setup Rules', description: 'Configure merge rules' },
  { title: 'Preview & Confirm', description: 'Review and confirm merge' },
];

const MergeObjectsPage: React.FC = () => {
  const [sourceObject, setSourceObject] = useState<Object | null>(null);
  const [targetObject, setTargetObject] = useState<Object | null>(null);
  const [mergeRules, setMergeRules] = useState<MergeRules>({
    nameSource: 'target',
    descriptionSource: 'target',
    customName: '',
    customDescription: '',
    typeValueRules: {},
  });

  const { activeStep, goToNext, goToPrevious } = useSteps({
    index: 0,
    count: steps.length,
  });
  const toast = useToast();

  const handleNext = () => {
    if (activeStep === 0 && (!sourceObject || !targetObject)) {
      toast({
        title: 'Please select both objects',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    goToNext();
  };

  const handleMerge = async () => {
    try {
      // TODO: Implement API call to merge objects
      // const response = await mergeObjects({
      //   sourceId: sourceObject!.id,
      //   targetId: targetObject!.id,
      //   rules: mergeRules
      // });

      toast({
        title: 'Objects merged successfully',
        status: 'success',
        duration: 3000,
      });

      // history.push(`/objects/${response.id}`);
    } catch (error) {
      toast({
        title: 'Error merging objects',
        description: 'Please try again later',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <ObjectSelectionStep
            sourceObject={sourceObject}
            targetObject={targetObject}
            onSourceSelect={setSourceObject}
            onTargetSelect={setTargetObject}
          />
        );
      case 1:
        return (
          <MergeRuleStep
            sourceObject={sourceObject!}
            targetObject={targetObject!}
            rules={mergeRules}
            onRulesChange={setMergeRules}
          />
        );
      case 2:
        return (
          <MergePreviewStep
            sourceObject={sourceObject!}
            targetObject={targetObject!}
            mergeRules={mergeRules}
          />
        );
    }
  };

  return (
    <Box p={4}>
      <BreadcrumbComponent />
      <Heading as='h1' size='xl' mb={6} color='var(--color-primary)'>
        Merge Objects
      </Heading>

      <Stepper index={activeStep} mb={8}>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepIndicator>
              <StepStatus
                complete={<StepIcon />}
                incomplete={<StepNumber />}
                active={<StepNumber />}
              />
            </StepIndicator>
            <Box flexShrink='0'>
              <StepTitle>{step.title}</StepTitle>
              <StepDescription>{step.description}</StepDescription>
            </Box>
          </Step>
        ))}
      </Stepper>

      {renderStep()}

      <HStack justify='flex-end' mt={6} spacing={4}>
        {activeStep > 0 && (
          <Button onClick={goToPrevious} variant='outline'>
            Previous
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            colorScheme='blue'
            isDisabled={activeStep === 0 && (!sourceObject || !targetObject)}
          >
            Next
          </Button>
        ) : (
          <Button onClick={handleMerge} colorScheme='blue'>
            Complete Merge
          </Button>
        )}
      </HStack>
    </Box>
  );
};

export default MergeObjectsPage;
