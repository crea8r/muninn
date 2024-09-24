import React from 'react';
import { Box, VStack, Text, Heading, Badge } from '@chakra-ui/react';
import { Fact, StepAndFunnel } from '../../types/';
import { RichTextViewer } from '../rich-text/';

interface ActivityFeedProps {
  facts: Fact[];
  stepsAndFunnels: StepAndFunnel[];
}
type ActivityItem = {
  text: string;
  location: string;
  happened_at: string;
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  facts,
  stepsAndFunnels,
}) => {
  const groupItemsByDate = (items: ActivityItem[]) => {
    const grouped: { [date: string]: ActivityItem[] } = {};
    items.forEach((item) => {
      const date = new Date(item.happened_at).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    return grouped;
  };
  const stepHistoryItems = stepsAndFunnels.map((stepAndFunnel) => {
    return {
      text: `In *${stepAndFunnel.funnelName}* moved to step *${stepAndFunnel.stepName}*`,
      location: '',
      happened_at: stepAndFunnel.createdAt,
    };
  });
  const groupedFacts = groupItemsByDate([...facts, ...stepHistoryItems]);

  return (
    <Box>
      <VStack align='stretch' spacing={6}>
        {Object.entries(groupedFacts).map(([date, dateItems]) => (
          <Box key={date}>
            <Heading size='sm' mb={2}>
              {date}
            </Heading>
            <VStack align='stretch' spacing={4}>
              {dateItems.map((item, i) => (
                <Box key={'items-' + i} borderWidth={1} borderRadius='md' p={4}>
                  <RichTextViewer content={item.text} />
                  {item.location && (
                    <Text fontSize='sm' color='gray.500' mt={2}>
                      Location: {item.location}
                    </Text>
                  )}
                  <Text fontSize='sm' color='gray.500' mt={1}>
                    {new Date(item.happened_at).toLocaleTimeString()}
                  </Text>
                </Box>
              ))}
            </VStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default ActivityFeed;
