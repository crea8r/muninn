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
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { RichTextEditor, RichTextViewer } from 'src/components/rich-text';
import {
  TagInput,
  ObjectTypePanel,
  TaskPanel,
  FunnelPanel,
  ActivityFeed,
} from 'src/components/object-page';
import { FactForm } from 'src/components/forms';
import { Object, Fact, NewFact, Tag } from 'src/types/';
import { fetchObjectDetails, updateObject, addFact } from 'src/api';

interface ObjectDetailPageProps {
  objectId: string;
}

const ObjectDetailPage: React.FC<ObjectDetailPageProps> = ({ objectId }) => {
  const [object, setObject] = useState<Object | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [facts, setFacts] = useState<Fact[]>([]);
  const toast = useToast();

  useEffect(() => {
    const loadObjectDetails = async () => {
      try {
        const details = await fetchObjectDetails(objectId);
        setObject(details.object);
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
  }, [objectId, toast]);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (object) {
      setObject({ ...object, name: event.target.value });
    }
  };

  const handleDescriptionChange = (content: any) => {
    // if (object) {
    //   setObject({ ...object, description: content });
    // }
  };

  const handleTagsChange = (newTags: Tag[]) => {
    if (object) {
      setObject({ ...object, tags: newTags });
    }
  };

  const handleSave = async () => {
    if (object) {
      try {
        await updateObject(object);
        setIsEditing(false);
        toast({
          title: 'Object updated',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Error updating object',
          description: 'Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
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

  if (!object) {
    return <Text>Loading...</Text>;
  }

  return (
    // <Flex height='calc(100vh - 72px)' overflow='hidden'>
    <Flex height='calc(100vh - 96px)' overflow='hidden'>
      {/* <Flex height='100%' overflow='hidden'> */}
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

          <Heading as='h1' size='xl'>
            {isEditing ? (
              <input
                value={object.name}
                onChange={handleNameChange}
                style={{ fontSize: 'inherit', width: '100%' }}
              />
            ) : (
              object.name
            )}
          </Heading>
          <TagInput
            tags={object.tags}
            onChange={handleTagsChange}
            isReadOnly={!isEditing}
          />
          {isEditing ? (
            <RichTextEditor
              initialValue={object.description}
              onSave={handleDescriptionChange}
            />
          ) : (
            <RichTextViewer content={object.description} />
          )}
          <Tabs>
            <TabList>
              <Tab>Object Type</Tab>
              <Tab>Tasks</Tab>
              <Tab>Funnel</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <ObjectTypePanel objectId={objectId} />
              </TabPanel>
              <TabPanel>
                <TaskPanel objectId={objectId} />
              </TabPanel>
              <TabPanel>
                <FunnelPanel objectId={objectId} />
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
        <VStack align='stretch' spacing={4} height='100%'>
          <Heading as='h2' size='lg'>
            Activity
          </Heading>
          <Box flexGrow={1} overflowY='auto'>
            <ActivityFeed facts={facts} />
          </Box>
          <Box>
            <FactForm onSave={handleAddFact} objectId={objectId} />
          </Box>
        </VStack>
      </Box>
    </Flex>
  );
};

export default ObjectDetailPage;
