import React, { useState, useEffect } from 'react';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  IconButton,
  Spacer,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useHistory, useParams } from 'react-router-dom';
import { Funnel, FunnelStep, FunnelUpdate } from 'src/types';
import { deleteFunnel, getFunnel, updateFunnel } from 'src/api/funnel';
import ResizableFunnelTable from './ResizableFunnelTable';
import EditStepNameDialog from './EditStepNameDialog';
import MarkdownModal from './MarkdownModal';
import LoadingPanel from 'src/components/LoadingPanel';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { EditFunnelForm } from 'src/components/forms';
import { FaFunnelDollar } from 'react-icons/fa';
import { UnsavedChangesProvider } from 'src/contexts/unsaved-changes/UnsavedChange';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import MarkdownDisplay from 'src/components/mardown/MarkdownDisplay';

const FunnelConfigPageWrapper: React.FC = () => {
  return (
    <UnsavedChangesProvider enabled={true}>
      <FunnelConfigPage />;
    </UnsavedChangesProvider>
  );
};

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
  const { refreshFunnels } = useGlobalContext();
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
  const {
    isOpen: isAdvancedEditFunnelOpen,
    onOpen: onAdvancedEditFunnelOpen,
    onClose: onAdvancedEdiFunnelClose,
  } = useDisclosure();
  const history = useHistory();

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
        steps_update: (funnel.steps || []).map((step) =>
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

  const handleUpdateFunnel = async (funnelUpdate: FunnelUpdate) => {
    try {
      setIsLoading(true);
      await updateFunnel(funnelUpdate);
      setForcedUpdate(forcedUpdate + 1);
      onEditClose();
      toast({
        title: 'Funnel updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error updating funnel',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      refreshFunnels();
      setIsLoading(false);
    }
  };

  const handleClickEditFunnel = () => {
    onAdvancedEditFunnelOpen();
  };

  const handleClickFunnel = () => {
    history.push(`/settings/funnels/${id}`);
  };

  const handleDeleteFunnel = async () => {
    if (!funnel) return;
    if (window.confirm('Are you sure you want to delete this funnel?')) {
      try {
        setIsLoading(true);
        await deleteFunnel(funnel.id);
        toast({
          title: 'Funnel deleted',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        history.replace('/settings/funnels');
      } catch (error) {
        toast({
          title: 'Error deleting funnel',
          description: 'Might being used in some objects.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        refreshFunnels();
        setIsLoading(false);
      }
    }
  };

  return (
    <Box p={4}>
      {isLoading || !funnel ? (
        <LoadingPanel />
      ) : (
        <>
          <Flex direction='row' mb={3}>
            <Breadcrumb fontWeight={'light'}>
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
            <Spacer />
            <Box>
              <IconButton
                variant={'outline'}
                aria-label='Edit funnel'
                icon={<EditIcon />}
                onClick={handleClickEditFunnel}
                mr={2}
                isDisabled={isLoading || !funnel}
                size={'sm'}
              />
              <IconButton
                colorScheme='red'
                variant={'outline'}
                aria-label='Delete funnel'
                icon={<DeleteIcon />}
                onClick={handleDeleteFunnel}
                isDisabled={isLoading || !funnel}
                mr={2}
                size={'sm'}
              />
              <IconButton
                colorScheme='blue'
                variant={'outline'}
                icon={<FaFunnelDollar />}
                onClick={handleClickFunnel}
                aria-label={''}
                mr={2}
                size={'sm'}
              />
            </Box>
          </Flex>
          <VStack align='stretch' spacing={3} background={'white'} p={4}>
            <MarkdownDisplay
              content={funnel.description}
              characterLimit={200}
            />
            <ResizableFunnelTable
              steps={funnel.steps || []}
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

          <EditFunnelForm
            isOpen={isAdvancedEditFunnelOpen && !isLoading}
            onClose={onAdvancedEdiFunnelClose}
            funnel={funnel}
            onSave={handleUpdateFunnel}
          />
        </>
      )}
    </Box>
  );
};

export default FunnelConfigPageWrapper;
