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
  HStack,
  IconButton,
  useMediaQuery,
  Badge,
  Modal,
  ModalHeader,
  ModalContent,
  ModalBody,
  useDisclosure,
  ModalOverlay,
  Alert,
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import MarkdownDisplay from 'src/components/mardown/MarkdownDisplay';
import {
  TagInput,
  ObjectTypePanel,
  TaskPanel,
  FunnelPanel,
  ActivityFeed,
} from 'src/pages/object/object-detail/fragments';
import { FactForm, ObjectForm } from 'src/components/forms';
import {
  Fact,
  NewTask,
  Task,
  TaskStatus,
  UpdateObject,
  UpdateTask,
} from 'src/types/';
import {
  fetchObjectDetails,
  updateObject,
  createFact,
  updateFact,
  createTask,
  updateTask,
  deleteTask,
  deleteObject,
} from 'src/api';
import { useHistory, useParams } from 'react-router-dom';
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
import { ObjectDetail, ObjectTypeValue } from 'src/types/Object';
import { FaPlus } from 'react-icons/fa';
import { FactToCreate, FactToUpdate } from 'src/api/fact';
import BreadcrumbComponent from 'src/components/Breadcrumb';
import LoadingModal from 'src/components/LoadingModal';
import SmartImage from 'src/components/SmartImage';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import { shortenText } from 'src/utils';

const extractFunnelSteps = (object: ObjectDetail) => {
  const stepsAndFunnels = object.stepsAndFunnels;
  const steps = stepsAndFunnels.map((step) => step.stepName);
  return steps;
};

const ObjectDetailPage: React.FC = () => {
  const { objectId } = useParams<{ objectId: string }>();
  const [object, setObject] = useState<ObjectDetail | null>(null);
  const [facts, setFacts] = useState<Fact[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const toast = useToast();
  const [showEditObject, setShowEditObject] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isLargerThan1280] = useMediaQuery('(min-width: 1280px)');
  const [isLoading, setIsLoading] = useState(false);
  const { refreshGlobalData } = useGlobalContext();
  const {
    isOpen: isOpenNewActivityDialog,
    onOpen: onOpenNewActivityDialog,
    onClose: onCloseNewActivityDialog,
  } = useDisclosure();
  const [imgUrls, setImgUrls] = useState<string[]>([]);
  const [tabIndex, setTabIndex] = useState(1);
  const history = useHistory();

  const handleTabIndexChange = (index: number) => {
    setTabIndex(index);
  };

  const loadImageUrlsFromObject = (obj: ObjectDetail) => {
    const tmp: string[] = [];
    obj?.typeValues.forEach((otv: ObjectTypeValue) => {
      window.Object.entries(otv.type_values).forEach(([_, value]) => {
        if (
          value &&
          (value.includes('http://') || value.includes('https://'))
        ) {
          tmp.push(value);
        }
      });
    });
    return tmp;
  };

  useEffect(() => {
    setIsRightPanelOpen(isLargerThan1280);
  }, [isLargerThan1280]);

  useEffect(() => {
    const loadObjectDetails = async () => {
      try {
        setIsLoading(true);
        const details = await fetchObjectDetails(objectId);
        setObject(details);
        setFacts(details.facts);
        setTasks(details.tasks.filter((task: Task) => task.deletedAt === null));
        setImgUrls(loadImageUrlsFromObject(details));
        if (
          details.tasks.filter(
            (task: any) => task.status !== TaskStatus.COMPLETED
          ).length > 0
        ) {
          setTabIndex(0);
        }
      } catch (error) {
        toast({
          title: 'Error loading object details',
          description: 'Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadObjectDetails();
  }, [objectId, toast, forceUpdate]);

  const handleTagsAdd = async (tagId: string) => {
    setIsLoading(true);
    await addTagToObject(objectId, tagId);
    setForceUpdate(forceUpdate + 1);
    setIsLoading(false);
  };

  const handleTagsRemove = async (tagId: string) => {
    setIsLoading(true);
    await removeTagFromObject(objectId, tagId);
    setForceUpdate(forceUpdate + 1);
    setIsLoading(false);
  };

  const handleUpdateObject = async (updatedObject: UpdateObject) => {
    setIsLoading(true);
    await updateObject(updatedObject);
    setForceUpdate(forceUpdate + 1);
    setIsLoading(false);
  };

  const handleDeleteObject = async (id: string) => {
    setIsLoading(true);
    await deleteObject(id);
    history.push('/objects');
    setIsLoading(false);
  };

  const handleAddFact = async (toSubmitFact: FactToUpdate | FactToCreate) => {
    setIsLoading(true);
    if ('id' in toSubmitFact) {
      await updateFact(toSubmitFact);
    } else {
      await createFact(toSubmitFact);
    }
    setForceUpdate(forceUpdate + 1);
    onCloseNewActivityDialog();
    setIsLoading(false);
  };

  const handleAddObjectTypeValue = async (objectId: string, payload: any) => {
    setIsLoading(true);
    await addObjectTypeValue(objectId, payload);
    setForceUpdate(forceUpdate + 1);
    setIsLoading(false);
  };

  const handleRemoveObjectTypeValue = async (
    objectId: string,
    objTypeValueId: string
  ) => {
    setIsLoading(true);
    await removeObjectTypeValue(objectId, objTypeValueId);
    setForceUpdate(forceUpdate + 1);
    setIsLoading(false);
  };

  const handleUpdateObjectTypeValue = async (
    objectId: string,
    objTypeValueId: string,
    payload: any
  ) => {
    setIsLoading(true);
    await updateObjectTypeValue(objectId, objTypeValueId, payload);
    setForceUpdate(forceUpdate + 1);
    setIsLoading(false);
  };

  const handleAddOrMoveObjectInFunnel = async (
    objectId: string,
    stepId: string
  ) => {
    setIsLoading(true);
    await addOrMoveObjectInFunnel(objectId, stepId);
    setForceUpdate(forceUpdate + 1);
    setIsLoading(false);
  };

  const handleDeleteObjectFromFunnel = async (objectStepId: string) => {
    setIsLoading(true);
    await deleteObjectFromFunnel(objectStepId);
    setForceUpdate(forceUpdate + 1);
    setIsLoading(false);
  };

  const handleUpdateSubStatus = async (objectId: string, subStatus: number) => {
    setIsLoading(true);
    await updateObjectStepSubStatus(objectId, subStatus);
    setForceUpdate(forceUpdate + 1);
    setIsLoading(false);
  };

  const handleAddTask = async (task: NewTask) => {
    setIsLoading(true);
    await createTask(task);
    setForceUpdate(forceUpdate + 1);
    refreshGlobalData();
    setIsLoading(false);
  };

  const handleUpdateTask = async (task: UpdateTask) => {
    setIsLoading(true);
    await updateTask(task.id, task);
    setForceUpdate(forceUpdate + 1);
    refreshGlobalData();
    setIsLoading(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    setIsLoading(true);
    await deleteTask(taskId);
    setForceUpdate(forceUpdate + 1);
    refreshGlobalData();
    setIsLoading(false);
  };

  return isLoading ? (
    <LoadingModal isOpen={isLoading} onClose={() => {}} />
  ) : (
    <>
      {object ? (
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
              <BreadcrumbComponent label={object?.name} />
              <HStack>
                <Heading as='h1' size='xl'>
                  <HStack>
                    <Box style={{ borderRadius: '100%', overflow: 'hidden' }}>
                      <SmartImage
                        src={imgUrls}
                        alt={object?.name || ''}
                        style={{
                          height: '32px',
                        }}
                      />
                    </Box>

                    <Text>{object?.name}</Text>
                  </HStack>
                </Heading>
              </HStack>
              <Flex>
                {extractFunnelSteps(object).map((step, index) => (
                  <Badge
                    textTransform={'none'}
                    variant={'outline'}
                    size={'sm'}
                    key={index}
                    mr={2}
                    colorScheme='blue'
                    title={step}
                  >
                    {shortenText(step, 10)}
                  </Badge>
                ))}
              </Flex>
              <FunnelPanel
                objectId={objectId}
                onAddOrMoveObjectInFunnel={handleAddOrMoveObjectInFunnel}
                onDeleteObjectFromFunnel={handleDeleteObjectFromFunnel}
                onUpdateSubStatus={handleUpdateSubStatus}
                stepsAndFunnels={object?.stepsAndFunnels || []}
              />
              <Tabs index={tabIndex} onChange={handleTabIndexChange}>
                <TabList>
                  <Tab>
                    Tasks
                    {tasks.filter(
                      (task) => task.status !== TaskStatus.COMPLETED
                    ).length > 0 && (
                      <Badge colorScheme='red' ml={2}>
                        {
                          tasks.filter(
                            (task) => task.status !== TaskStatus.COMPLETED
                          ).length
                        }
                      </Badge>
                    )}
                  </Tab>
                  <Tab>
                    <Text mr={2}>Activity Log</Text>
                    <FaPlus onClick={onOpenNewActivityDialog} />
                  </Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <TaskPanel
                      objectId={objectId}
                      tasks={tasks}
                      objectName={object.name}
                      onAddTask={handleAddTask}
                      onUpdateTask={handleUpdateTask}
                      onDeleteTask={handleDeleteTask}
                    />
                  </TabPanel>
                  <TabPanel>
                    <Box flexGrow={1} overflowY='auto'>
                      {object && (
                        <ActivityFeed
                          facts={facts}
                          stepsAndFunnels={object?.stepsAndFunnels || []}
                          object={object}
                          onSave={handleAddFact}
                        />
                      )}
                    </Box>
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
            />
            {isRightPanelOpen && (
              <VStack align='stretch' spacing={4} height='100%' mt={10}>
                <HStack align='stretch' spacing={2}>
                  <Heading as='h2' size='md'>
                    Detail
                  </Heading>
                  <EditIcon
                    fontSize='x-large'
                    onClick={() => {
                      setShowEditObject(true);
                    }}
                  />
                </HStack>

                {object?.description && object?.description !== '' && (
                  <>
                    <MarkdownDisplay
                      content={object.description}
                      characterLimit={200}
                    />
                  </>
                )}

                <TagInput
                  tags={object?.tags || []}
                  onAddTag={handleTagsAdd}
                  onRemoveTag={handleTagsRemove}
                  isReadOnly={false}
                />
                <ObjectTypePanel
                  objectId={objectId}
                  objectTypes={object?.typeValues || []}
                  onAddObjectTypeValue={handleAddObjectTypeValue}
                  onRemoveObjectTypeValue={handleRemoveObjectTypeValue}
                  onUpdateObjectTypeValue={handleUpdateObjectTypeValue}
                />
              </VStack>
            )}
          </Box>

          {object && (
            <ObjectForm
              initialObject={object}
              isOpen={showEditObject}
              onClose={() => setShowEditObject(false)}
              onUpdateObject={handleUpdateObject}
              onDeleteObject={handleDeleteObject}
            />
          )}

          <Modal
            isOpen={isOpenNewActivityDialog}
            onClose={onCloseNewActivityDialog}
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Add New Activity</ModalHeader>
              <ModalBody>
                {object && (
                  <FactForm onSave={handleAddFact} requireObject={object} />
                )}
              </ModalBody>
            </ModalContent>
          </Modal>
        </Flex>
      ) : (
        <Alert status='error'>Object not found. Try it again!</Alert>
      )}
    </>
  );
};

export default ObjectDetailPage;
