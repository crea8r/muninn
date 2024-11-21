import React, { useEffect } from 'react';
import {
  Box,
  SkeletonText,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
  Text,
  Badge,
} from '@chakra-ui/react';
import {
  ObjectDetailProvider,
  useObjectDetail,
} from './contexts/ObjectDetailContext';
import { ActivityFeed, CreateActivityButton } from './components/ActivityFeed';
import { CreateFunnelStepButton, FunnelPanel } from './components/FunnelPanel';
import { ObjectHeading } from './components/ObjectHeading';
import { TaskPanel, CreateTaskButton } from './components/TaskPanel';
import {
  CreateObjectTypeValueButton,
  ObjectTypePanel,
} from './components/ObjectTypePanel';
import { TaskStatus } from 'src/types';
import { TagInput } from './components/TagInput';

const ObjectDetailPanel: React.FC<{ objectId: string }> = ({ objectId }) => {
  return (
    <ObjectDetailProvider objectId={objectId}>
      <ObjectDetailContent />
    </ObjectDetailProvider>
  );
};

const ObjectDetailContent: React.FC = () => {
  const { object, facts, tasks, isLoading, tabIndex, setTabIndex } =
    useObjectDetail();
  const countTask = tasks.filter(
    (task) => task.status !== TaskStatus.COMPLETED
  ).length;
  const countActivity = facts.length;
  const countFunnel = object?.stepsAndFunnels.length || 0;
  const countDetail = object?.typeValues.length || 0;
  const countTags = object?.tags.length || 0;
  useEffect(() => {
    if (countTask > 0) {
      setTabIndex(0);
    } else {
      setTabIndex(1);
    }
  }, [countTask, setTabIndex]);
  const handleTabIndexChange = (index: number) => {
    setTabIndex(index);
  };
  return (
    <Box height='100%' overflowX='hidden' overflowY={'scroll'}>
      {isLoading ? (
        <SkeletonText noOfLines={10} width='100%' height={'auto'} />
      ) : (
        <VStack gap={2} width={'100%'}>
          <ObjectHeading />
          <Tabs width={'100%'} index={tabIndex} onChange={handleTabIndexChange}>
            <TabList>
              <Tab>
                <Text mr={2}>Tasks</Text>
                {countTask > 0 && (
                  <Badge colorScheme='red' mr={2}>
                    {countTask}
                  </Badge>
                )}
                <CreateTaskButton />
              </Tab>
              <Tab>
                <Text mr={2}>Activity</Text>
                {countActivity > 0 && (
                  <Badge colorScheme='blue' variant={'outline'} mr={2}>
                    {countActivity}
                  </Badge>
                )}
                <CreateActivityButton />
              </Tab>
              <Tab>
                <Text mr={2}>Funnel</Text>
                {countFunnel > 0 && (
                  <Badge colorScheme='blue' variant={'outline'} mr={2}>
                    {countFunnel}
                  </Badge>
                )}
                <CreateFunnelStepButton />
              </Tab>
              <Tab>
                <Text mr={2}>Detail</Text>
                {countDetail > 0 && (
                  <Badge colorScheme='blue' variant={'outline'} mr={2}>
                    {countDetail}
                  </Badge>
                )}
                <CreateObjectTypeValueButton />
              </Tab>
              <Tab>
                <Text mr={2}>Tags</Text>
                {countTags > 0 && (
                  <Badge colorScheme='blue' variant={'outline'} mr={2}>
                    {countTags}
                  </Badge>
                )}
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <TaskPanel />
              </TabPanel>
              <TabPanel>
                <ActivityFeed />
              </TabPanel>
              <TabPanel>
                <FunnelPanel />
              </TabPanel>
              <TabPanel>
                <ObjectTypePanel />
              </TabPanel>
              <TabPanel>
                <TagInput />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      )}
    </Box>
  );
};

export default ObjectDetailPanel;
