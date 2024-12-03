import React, { useEffect } from 'react';
import {
  Box,
  SkeletonText,
  VStack,
  Text,
  Badge,
  HStack,
  Flex,
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

  const tabItems = [
    {
      label: (
        <>
          <Text mr={2}>Tasks</Text>
          {countTask > 0 && (
            <Badge colorScheme='red' mr={2}>
              {countTask}
            </Badge>
          )}
          <CreateTaskButton />
        </>
      ),
      content: <TaskPanel />,
    },
    {
      label: (
        <>
          <Text mr={2}>Activity</Text>
          {countActivity > 0 && (
            <Badge colorScheme='blue' variant={'outline'} mr={2}>
              {countActivity}
            </Badge>
          )}
          <CreateActivityButton />
        </>
      ),
      content: <ActivityFeed />,
    },
    {
      label: (
        <>
          <Text mr={2}>Funnel</Text>
          {countFunnel > 0 && (
            <Badge colorScheme='blue' variant={'outline'} mr={2}>
              {countFunnel}
            </Badge>
          )}
          <CreateFunnelStepButton />
        </>
      ),
      content: <FunnelPanel />,
    },
    {
      label: (
        <>
          <Text mr={2}>Detail</Text>
          {countDetail > 0 && (
            <Badge colorScheme='blue' variant={'outline'} mr={2}>
              {countDetail}
            </Badge>
          )}
          <CreateObjectTypeValueButton />
        </>
      ),
      content: <ObjectTypePanel />,
    },
    {
      label: (
        <>
          <Text mr={2}>Tags</Text>
          {countTags > 0 && (
            <Badge colorScheme='blue' variant={'outline'} mr={2}>
              {countTags}
            </Badge>
          )}
        </>
      ),
      content: <TagInput />,
    },
  ];
  return (
    <Box height='100%' overflowX='hidden' overflowY={'scroll'}>
      {isLoading ? (
        <SkeletonText noOfLines={4} width='100%' height={30} />
      ) : (
        <VStack gap={2} width={'100%'}>
          <ObjectHeading />
          <MTab
            items={tabItems}
            selectedIndex={tabIndex}
            onChange={handleTabIndexChange}
          />
        </VStack>
      )}
    </Box>
  );
};

interface MTabProps {
  selectedIndex?: number;
  items: Array<{ label: React.ReactNode; content: React.ReactNode }>;
  onChange: (index: number) => void;
}

// write me a tab component to avoid the key capture of existing tabs compoent
const MTab: React.FC<MTabProps> = ({
  items,
  onChange,
  selectedIndex = 0,
}: MTabProps) => {
  const labels = items.map((item) => item.label);
  return (
    <VStack width={'100%'}>
      <HStack
        width={'100%'}
        gap={1}
        borderBottom={'solid 1px gray'}
        borderColor={'gray.200'}
      >
        {labels.map((label, index) => (
          <Flex
            mb={-0.5}
            key={index}
            onClick={() => onChange(index)}
            alignItems={'center'}
            _hover={{ background: 'gray.100', cursor: 'pointer' }}
            p={1}
            px={2}
            style={{
              borderBottom: index === selectedIndex ? '2px solid' : '0px',
            }}
            borderColor={'var(--color-primary)'}
          >
            {label}
          </Flex>
        ))}
      </HStack>
      <Box width={'100%'} mt={2}>
        {items[selectedIndex].content}
      </Box>
    </VStack>
  );
};
export default ObjectDetailPanel;
