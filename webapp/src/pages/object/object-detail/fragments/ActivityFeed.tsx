import React from 'react';
import { Box, VStack, Text, Heading, Badge } from '@chakra-ui/react';
import { Fact, StepAndFunnel } from 'src/types/';
import { RichTextViewer } from 'src/components/rich-text';
import dayjs from 'dayjs';
import FactItem from 'src/components/FactItem';
import { randomId } from 'src/utils';

interface ActivityFeedProps {
  facts: Fact[];
  stepsAndFunnels: StepAndFunnel[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  facts,
  stepsAndFunnels,
}) => {
  const groupItemsByDate = (items: Fact[]) => {
    const grouped: { [date: string]: Fact[] } = {};
    items.forEach((item) => {
      console.log(item);
      const date = dayjs(item.happenedAt).toDate().toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    return grouped;
  };
  const factHistoryItems = facts.map((fact) => {
    return fact;
  });
  const stepHistoryItems = stepsAndFunnels.map((stepAndFunnel) => {
    return {
      id: randomId(4),
      text: `In *${stepAndFunnel.funnelName}* moved to step *${stepAndFunnel.stepName}*`,
      location: '',
      happenedAt: stepAndFunnel.createdAt,
      creatorId: '',
      createdAt: '',
      relatedObjects: [],
    };
  });
  const groupedFacts = groupItemsByDate([
    ...factHistoryItems,
    ...stepHistoryItems,
  ]);

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
                <FactItem key={i} fact={item} handleClick={() => {}} />
              ))}
            </VStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default ActivityFeed;
