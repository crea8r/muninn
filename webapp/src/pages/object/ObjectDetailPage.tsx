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
} from '@chakra-ui/react';
import { ChevronRightIcon, EditIcon } from '@chakra-ui/icons';
import { RichTextViewer } from 'src/components/rich-text';
import {
  TagInput,
  ObjectTypePanel,
  TaskPanel,
  FunnelPanel,
  ActivityFeed,
} from 'src/components/object-page';
import { FactForm, ObjectForm } from 'src/components/forms';
import { Object, Fact, NewFact, Tag, UpdateObject } from 'src/types/';
import { fetchObjectDetails, updateObject, addFact } from 'src/api';
import { useParams } from 'react-router-dom';
import {
  addObjectTypeValue,
  addTagToObject,
  removeObjectTypeValue,
  removeTagFromObject,
  updateObjectTypeValue,
} from 'src/api/object';
import ActionSuggestion from 'src/components/object-page/ActionSuggestion';

interface ObjectDetailPageProps {}

const ObjectDetailPage: React.FC<ObjectDetailPageProps> = ({}) => {
  const { objectId } = useParams<{ objectId: string }>();
  const [object, setObject] = useState<Object | null>(null);
  const [facts, setFacts] = useState<Fact[]>([]);
  const toast = useToast();
  const [showEditObject, setShowEditObject] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    const loadObjectDetails = async () => {
      try {
        const details = await fetchObjectDetails(objectId);
        console.log('details:', details);
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

  if (!object) {
    return <Text>Loading...</Text>;
  }

  return (
    // <Flex height='calc(100vh - 72px)' overflow='hidden'>
    <Flex height='calc(100vh - 96px)' overflow='hidden'>
      {/*<Flex height='100%' overflow='hidden'>*/}
      {/* Left Column */}
      <Box
        width='60%'
        p={4}
        borderRight='1px solid'
        borderColor='gray.200'
        overflowY='auto'
        css={{
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}
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
              <BreadcrumbLink href='#'>{object.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
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
          <RichTextViewer content={object.description} />
          <TagInput
            tags={object.tags}
            onAddTag={handleTagsAdd}
            onRemoveTag={handleTagsRemove}
            isReadOnly={false}
          />
          <Tabs>
            <TabList>
              <Tab>Object Type</Tab>
              <Tab>Tasks</Tab>
              <Tab>Funnel</Tab>
              <Tab>🪄 Suggestion</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <ObjectTypePanel
                  objectId={objectId}
                  objectTypes={object.typeValues}
                  onAddObjectTypeValue={handleAddObjectTypeValue}
                  onRemoveObjectTypeValue={handleRemoveObjectTypeValue}
                  onUpdateObjectTypeValue={handleUpdateObjectTypeValue}
                />
              </TabPanel>
              <TabPanel>
                <TaskPanel objectId={objectId} />
              </TabPanel>
              <TabPanel>
                <FunnelPanel objectId={objectId} />
              </TabPanel>
              <TabPanel>
                <ActionSuggestion
                  objectId={objectId}
                  onActionTaken={(data: any) => {
                    console.log('data:', data);
                  }}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Box>

      {/* Right Column */}
      <Box
        width='40%'
        p={4}
        overflowY='auto'
        css={{
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}
      >
        {/* <VStack align='stretch' spacing={4} height='100%'> */}
        <VStack align='stretch' spacing={4} height='100%'>
          <Heading as='h2' size='lg'>
            Activity
          </Heading>
          <Box flexGrow={1} overflowY='auto'>
            <ActivityFeed facts={facts} />
          </Box>
          <FactForm onSave={handleAddFact} objectId={objectId} />
        </VStack>
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
