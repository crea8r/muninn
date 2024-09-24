import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  HStack,
  IconButton,
  useMediaQuery,
} from '@chakra-ui/react';
import { ChevronRightIcon, EditIcon } from '@chakra-ui/icons';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { RichTextViewer } from 'src/components/rich-text';
import {
  TagInput,
  ObjectTypePanel,
  TaskPanel,
  FunnelPanel,
  ActivityFeed,
} from 'src/pages/object/object-detail/fragments';
import { FactForm, ObjectForm } from 'src/components/forms';
import { Fact, NewFact, UpdateObject } from 'src/types/';
import { fetchObjectDetails, updateObject, addFact } from 'src/api';
import { useParams } from 'react-router-dom';
import {
  addObjectTypeValue,
  addTagToObject,
  removeObjectTypeValue,
  removeTagFromObject,
  updateObjectTypeValue,
  addOrMoveObjectInFunnel,
  deleteObjectFromFunnel,
  updateObjectStepSubStatus,
} from 'src/api';
import { ObjectDetail } from 'src/types/Object';

const ObjectDetailPage: React.FC = () => {
  const { objectId } = useParams<{ objectId: string }>();
  const [object, setObject] = useState<ObjectDetail | null>(null);
  const [facts, setFacts] = useState<Fact[]>([]);
  const toast = useToast();
  const [showEditObject, setShowEditObject] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isLargerThan1280] = useMediaQuery('(min-width: 1280px)');

  useEffect(() => {
    setIsRightPanelOpen(isLargerThan1280);
  }, [isLargerThan1280]);

  useEffect(() => {
    const loadObjectDetails = async () => {
      try {
        const details = await fetchObjectDetails(objectId);
        setObject(details);
        setFacts(details.facts);
      } catch (error) {
        toast({
          title: 'Error loading object details',
          description: 'Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    loadObjectDetails();
  }, [objectId, toast, forceUpdate]);

  const handleTagsAdd = async (tagId: string) => {
    await addTagToObject(objectId, tagId);
    setForceUpdate(forceUpdate + 1);
  };

  const handleTagsRemove = async (tagId: string) => {
    await removeTagFromObject(objectId, tagId);
    setForceUpdate(forceUpdate + 1);
  };

  const handleUpdateObject = async (updatedObject: UpdateObject) => {
    await updateObject(updatedObject);
    setForceUpdate(forceUpdate + 1);
  };

  const handleAddFact = async (newFact: NewFact) => {
    try {
      const addedFact = await addFact(newFact);
      setFacts([addedFact, ...facts]);
      toast({
        title: 'Fact added',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error adding fact',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAddObjectTypeValue = async (objectId: string, payload: any) => {
    await addObjectTypeValue(objectId, payload);
    setForceUpdate(forceUpdate + 1);
  };

  const handleRemoveObjectTypeValue = async (
    objectId: string,
    objTypeValueId: string
  ) => {
    await removeObjectTypeValue(objectId, objTypeValueId);
    setForceUpdate(forceUpdate + 1);
  };

  const handleUpdateObjectTypeValue = async (
    objectId: string,
    objTypeValueId: string,
    payload: any
  ) => {
    await updateObjectTypeValue(objectId, objTypeValueId, payload);
    setForceUpdate(forceUpdate + 1);
  };

  const handleAddOrMoveObjectInFunnel = async (
    objectId: string,
    stepId: string
  ) => {
    await addOrMoveObjectInFunnel(objectId, stepId);
    setForceUpdate(forceUpdate + 1);
  };

  const handleDeleteObjectFromFunnel = async (objectStepId: string) => {
    await deleteObjectFromFunnel(objectStepId);
    setForceUpdate(forceUpdate + 1);
  };

  const handleUpdateSubStatus = async (objectId: string, subStatus: number) => {
    await updateObjectStepSubStatus(objectId, subStatus);
    setForceUpdate(forceUpdate + 1);
  };

  if (!object) {
    return <Text>Loading...</Text>;
  }

  return (
    <Flex height='calc(100vh - 96px)' overflow='hidden'>
      {/* Left Column */}
      <Box
        width={isRightPanelOpen ? '60%' : '100%'}
        p={4}
        borderRight={isRightPanelOpen ? '1px solid' : 'none'}
        borderColor='gray.200'
        overflowY='auto'
        css={{
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}
        transition='width 0.3s'
      >
        <VStack align='stretch' spacing={4}>
          <Breadcrumb
            spacing='8px'
            separator={<ChevronRightIcon color='gray.500' />}
          >
            <BreadcrumbItem>
              <BreadcrumbLink href='/'>Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href='/objects'>Objects</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink href='#' fontWeight='bold'>
                {object.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <Heading as='h2' size='lg'>
            Activity
          </Heading>
          <Tabs>
            <TabList>
              <Tab>Facts</Tab>
              <Tab>Tasks</Tab>
              <Tab>Funnel</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Box flexGrow={1} overflowY='auto'>
                  <ActivityFeed
                    facts={facts}
                    stepsAndFunnels={object.stepsAndFunnels}
                  />
                </Box>
                <FactForm onSave={handleAddFact} objectId={objectId} />
              </TabPanel>
              <TabPanel>
                <TaskPanel objectId={objectId} />
              </TabPanel>
              <TabPanel>
                <FunnelPanel
                  objectId={objectId}
                  onAddOrMoveObjectInFunnel={handleAddOrMoveObjectInFunnel}
                  onDeleteObjectFromFunnel={handleDeleteObjectFromFunnel}
                  onUpdateSubStatus={handleUpdateSubStatus}
                  stepsAndFunnels={object.stepsAndFunnels}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Box>

      {/* Right Column */}
      <Box
        width={isRightPanelOpen ? '40%' : '40px'}
        minWidth={isRightPanelOpen ? '300px' : '40px'}
        p={isRightPanelOpen ? 4 : 0}
        overflowY='auto'
        overflowX='visible'
        css={{
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}
        transition='width 0.1s, padding 0s'
        position={isLargerThan1280 ? 'relative' : 'absolute'}
        right={0}
        top={0}
        bottom={0}
        bg='gray.50'
        zIndex={100}
        boxShadow={
          isLargerThan1280
            ? 'none'
            : isRightPanelOpen
            ? '0 0 10px rgba(0,0,0,0.1)'
            : 'none'
        }
      >
        <IconButton
          aria-label='Toggle right panel'
          icon={isRightPanelOpen ? <FiChevronRight /> : <FiChevronLeft />}
          position='absolute'
          left={isRightPanelOpen ? '0' : '0'}
          top='0'
          onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
          zIndex={2}
        />
        {isRightPanelOpen && (
          <VStack align='stretch' spacing={4} height='100%' mt={10}>
            <HStack>
              <Heading as='h1' size='xl'>
                {object.name}
              </Heading>
              <EditIcon
                fontSize='x-large'
                onClick={() => {
                  setShowEditObject(true);
                }}
              />
            </HStack>
            {object.description && object.description !== '' && (
              <RichTextViewer content={object.description} />
            )}

            <TagInput
              tags={object.tags}
              onAddTag={handleTagsAdd}
              onRemoveTag={handleTagsRemove}
              isReadOnly={false}
            />
            <ObjectTypePanel
              objectId={objectId}
              objectTypes={object.typeValues}
              onAddObjectTypeValue={handleAddObjectTypeValue}
              onRemoveObjectTypeValue={handleRemoveObjectTypeValue}
              onUpdateObjectTypeValue={handleUpdateObjectTypeValue}
            />
          </VStack>
        )}
      </Box>
      <ObjectForm
        initialObject={object}
        isOpen={showEditObject}
        onClose={() => setShowEditObject(false)}
        onUpdateObject={handleUpdateObject}
      />
    </Flex>
  );
};

export default ObjectDetailPage;
