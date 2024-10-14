import React, { useState, useEffect } from 'react';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { Funnel, FunnelStep } from 'src/types';
import { getFunnel, updateFunnel } from 'src/api/funnel';
import ResizableFunnelTable from './ResizableFunnelTable';
import EditStepNameDialog from './EditStepNameDialog';
import MarkdownModal from './MarkdownModal';
import ReactMarkdown from 'react-markdown';
import LoadingPanel from 'src/components/LoadingPanel';

const FunnelConfigPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [selectedStep, setSelectedStep] = useState<FunnelStep | null>(null);
  const [selectedContent, setSelectedContent] = useState<{
    title: string;
    content: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [forcedUpdate, setForcedUpdate] = useState(0);
  const toast = useToast();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isContentOpen,
    onOpen: onContentOpen,
    onClose: onContentClose,
  } = useDisclosure();

  useEffect(() => {
    const loadFunnel = async () => {
      setIsLoading(true);
      if (id) {
        const funnelData = await getFunnel(id);
        setFunnel(funnelData);
      }
      setIsLoading(false);
    };
    loadFunnel();
  }, [id, forcedUpdate]);

  const handleStepNameClick = (step: FunnelStep) => {
    setSelectedStep(step);
    onEditOpen();
  };

  const handleContentClick = (title: string, content: string) => {
    setSelectedContent({ title, content });
    onContentOpen();
  };

  const handleSaveStepName = async (
    funnel: Funnel,
    stepId: string,
    newName: string
  ) => {
    setIsLoading(true);
    try {
      await updateFunnel({
        ...funnel,
        steps_update: funnel.steps.map((step) =>
          step.id === selectedStep?.id ? { ...step, name: newName } : step
        ),
        steps_create: [],
        steps_delete: [],
        step_mapping: {},
      });
      setForcedUpdate(forcedUpdate + 1);
    } catch (e) {
      toast({
        title: 'Error saving step name',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={4}>
      {isLoading || !funnel ? (
        <LoadingPanel />
      ) : (
        <>
          <VStack align='stretch' spacing={4}>
            <Breadcrumb>
              <BreadcrumbItem>
                <BreadcrumbLink href='/'>Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href='/settings'>Setting</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href='/settings/funnels'>
                  Funnels
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem
                isCurrentPage
                p={0.5}
                background={'yellow.100'}
                fontWeight={'bold'}
              >
                <BreadcrumbLink href='#'>{funnel.name}</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <ReactMarkdown>{funnel.description}</ReactMarkdown>
            <ResizableFunnelTable
              steps={funnel.steps}
              onStepNameClick={handleStepNameClick}
              onContentClick={handleContentClick}
            />
          </VStack>

          <EditStepNameDialog
            isOpen={isEditOpen}
            onClose={onEditClose}
            step={selectedStep}
            onSave={(stepId, newName) => {
              handleSaveStepName(funnel, stepId, newName);
              onEditClose();
            }}
          />

          <MarkdownModal
            isOpen={isContentOpen}
            onClose={onContentClose}
            title={selectedContent?.title || ''}
            content={selectedContent?.content || ''}
          />
        </>
      )}
    </Box>
  );
};

export default FunnelConfigPage;
