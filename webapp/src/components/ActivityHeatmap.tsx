import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  Heading,
  SimpleGrid,
  Flex,
  Button,
  useTheme,
  HStack,
  VStack,
} from '@chakra-ui/react';

// Types remain the same
interface DailyMetrics {
  date: string;
  factsCreated: number;
  factObjectsInvolved: number;
  tasksTotal: number;
  tasksCompleted: number;
  taskObjectsInvolved: number;
  objectsCreated: number;
  typeValuesAdded: number;
  tagsAdded: number;
  objectsMovedInFunnels: number;
  funnelStepsInvolved: number;
  funnelsCreated: number;
  stepsCreated: number;
  stepsUpdated: number;
  stepsModified: number;
  typesCreated: number;
  typesUsed: number;
  typesUpdated: number;
  activityScore: number;
}

interface MetricsGroup {
  title: string;
  metrics: { label: string; value: number }[];
}

const defaultMetrics: DailyMetrics = {
  date: '',
  factsCreated: 0,
  factObjectsInvolved: 0,
  tasksTotal: 0,
  tasksCompleted: 0,
  taskObjectsInvolved: 0,
  objectsCreated: 0,
  typeValuesAdded: 0,
  tagsAdded: 0,
  objectsMovedInFunnels: 0,
  funnelStepsInvolved: 0,
  funnelsCreated: 0,
  stepsCreated: 0,
  stepsUpdated: 0,
  stepsModified: 0,
  typesCreated: 0,
  typesUsed: 0,
  typesUpdated: 0,
  activityScore: 0,
};

const ColorLevels = {
  0: 'gray.100',
  1: 'green.100',
  2: 'green.300',
  3: 'green.500',
  4: 'green.700',
};

const calculateColorIntensity = (score: number) => {
  if (score === 0) return ColorLevels[0];
  const logScore = Math.log(score + 1) / Math.log(20);
  const intensity = Math.min(Math.floor(logScore * 5), 4);
  return ColorLevels[intensity as keyof typeof ColorLevels];
};

const groupMetrics = (metrics: DailyMetrics): MetricsGroup[] => {
  return [
    {
      title: 'Setting Metrics',
      metrics: [
        { label: 'Types Created', value: metrics.typesCreated },
        { label: 'Types Updated', value: metrics.typesUpdated },
        { label: 'Types Used', value: metrics.typesUsed },
        { label: 'Funnels Created', value: metrics.funnelsCreated },
        { label: 'Steps Created', value: metrics.stepsCreated },
        { label: 'Steps Modified', value: metrics.stepsModified },
      ],
    },
    {
      title: 'Operational Metrics',
      metrics: [
        { label: 'Facts Created', value: metrics.factsCreated },
        {
          label: 'Objects Involved in Facts',
          value: metrics.factObjectsInvolved,
        },
        { label: 'Total Tasks', value: metrics.tasksTotal },
        { label: 'Completed Tasks', value: metrics.tasksCompleted },
        { label: 'Objects in Tasks', value: metrics.taskObjectsInvolved },
        { label: 'Objects Created', value: metrics.objectsCreated },
        { label: 'Type Values Added', value: metrics.typeValuesAdded },
        { label: 'Tags Added', value: metrics.tagsAdded },
        {
          label: 'Objects Moved in Funnels',
          value: metrics.objectsMovedInFunnels,
        },
        { label: 'Funnel Steps Involved', value: metrics.funnelStepsInvolved },
      ],
    },
  ];
};

const MetricsModal = ({
  metrics,
  isOpen,
  onClose,
}: {
  metrics: DailyMetrics;
  isOpen: boolean;
  onClose: () => void;
}) => (
  <Modal isOpen={isOpen} onClose={onClose} size='2xl'>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>
        Activity for {dayjs(metrics.date).format('MMMM D, YYYY')}
      </ModalHeader>
      <ModalCloseButton />
      <ModalBody pb={6}>
        <VStack spacing={6} align='stretch'>
          {groupMetrics(metrics).map((group, i) => (
            <Box key={i}>
              <Heading size='md' mb={4}>
                {group.title}
              </Heading>
              <SimpleGrid columns={2} spacing={4}>
                {group.metrics.map((metric, j) => (
                  <Box key={j} bg='gray.50' p={3} borderRadius='md'>
                    <Text color='gray.600' fontSize='sm'>
                      {metric.label}
                    </Text>
                    <Text fontSize='lg' fontWeight='medium'>
                      {metric.value}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          ))}
        </VStack>
      </ModalBody>
    </ModalContent>
  </Modal>
);

const ActivityCell = ({
  metrics,
  onClick,
}: {
  metrics: DailyMetrics;
  onClick: (metrics: DailyMetrics) => void;
}) => (
  <Box
    w='12px'
    h='12px'
    borderRadius='sm'
    bg={calculateColorIntensity(metrics.activityScore)}
    cursor='pointer'
    onClick={() => onClick(metrics)}
    title={`${metrics.activityScore} activities on ${dayjs(metrics.date).format(
      'YYYY-MM-DD'
    )}`}
  />
);

const ActivityHeatmap = ({
  startDate,
  metricsData,
}: {
  startDate: Date;
  metricsData: DailyMetrics[];
}) => {
  const [selectedMetrics, setSelectedMetrics] = useState<DailyMetrics | null>(
    null
  );
  const theme = useTheme();

  // Convert array to map for easier lookup
  const metricsMap = useMemo(() => {
    return metricsData.reduce((acc, metrics) => {
      acc[dayjs(metrics.date).format('YYYY-MM-DD')] = metrics;
      return acc;
    }, {} as Record<string, DailyMetrics>);
  }, [metricsData]);

  const calendarData = useMemo(() => {
    const start = dayjs(startDate);
    const end = start.add(29, 'day');
    const firstDay = start.startOf('week');

    let calendar = [];
    let currentWeek = [];
    let currentDate = firstDay;

    while (currentDate.isBefore(start, 'day')) {
      currentWeek.push(null);
      currentDate = currentDate.add(1, 'day');
    }

    while (currentDate.isBefore(end, 'day') || currentDate.isSame(end, 'day')) {
      if (currentWeek.length === 7) {
        calendar.push(currentWeek);
        currentWeek = [];
      }

      const dateStr = currentDate.format('YYYY-MM-DD');
      currentWeek.push({
        date: dateStr,
        metrics: metricsMap[dateStr] || {
          ...defaultMetrics,
          date: currentDate.toISOString(),
        },
      });

      currentDate = currentDate.add(1, 'day');
    }

    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    calendar.push(currentWeek);

    return calendar;
  }, [startDate, metricsMap]);

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Box display='inline-block'>
      <HStack spacing={0}>
        {weekdays.map((day) => (
          <Text
            key={day}
            w='12px'
            fontSize='xs'
            color='gray.500'
            textAlign='center'
            mx={1}
          >
            {day[0]}
          </Text>
        ))}
      </HStack>

      <VStack spacing={1} align='stretch'>
        {calendarData.map((week, i) => (
          <Flex key={i} h='20px' align='center'>
            {week.map((day, j) => (
              <Box key={j} mx={1}>
                {day ? (
                  <ActivityCell
                    metrics={day.metrics}
                    onClick={(metrics) => setSelectedMetrics(metrics)}
                  />
                ) : (
                  <Box w='12px' h='12px' />
                )}
              </Box>
            ))}
          </Flex>
        ))}
      </VStack>

      <Flex mt={4} align='center'>
        <Text fontSize='xs' color='gray.600' mr={2}>
          Less
        </Text>
        <HStack spacing={1}>
          {Object.values(ColorLevels).map((color, i) => (
            <Box key={i} w='12px' h='12px' borderRadius='sm' bg={color} />
          ))}
        </HStack>
        <Text fontSize='xs' color='gray.600' ml={2}>
          More
        </Text>
      </Flex>

      <MetricsModal
        metrics={selectedMetrics || defaultMetrics}
        isOpen={!!selectedMetrics}
        onClose={() => setSelectedMetrics(null)}
      />
    </Box>
  );
};

export default ActivityHeatmap;
