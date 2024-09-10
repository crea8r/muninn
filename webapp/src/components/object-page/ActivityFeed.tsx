import React from 'react';
import { Box, VStack, Text, Heading } from '@chakra-ui/react';
import { Fact } from '../../types/';
import { RichTextViewer } from '../rich-text/';

interface ActivityFeedProps {
  facts: Fact[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ facts }) => {
  const groupFactsByDate = (facts: Fact[]) => {
    const grouped: { [date: string]: Fact[] } = {};
    facts.forEach((fact) => {
      const date = new Date(fact.happened_at).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(fact);
    });
    return grouped;
  };

  const groupedFacts = groupFactsByDate(facts);

  return (
    <Box>
      <VStack align='stretch' spacing={6}>
        {Object.entries(groupedFacts).map(([date, dateFacts]) => (
          <Box key={date}>
            <Heading size='sm' mb={2}>
              {date}
            </Heading>
            <VStack align='stretch' spacing={4}>
              {dateFacts.map((fact) => (
                <Box key={fact.id} borderWidth={1} borderRadius='md' p={4}>
                  <RichTextViewer content={fact.text} />
                  {fact.location && (
                    <Text fontSize='sm' color='gray.500' mt={2}>
                      Location: {fact.location}
                    </Text>
                  )}
                  <Text fontSize='sm' color='gray.500' mt={1}>
                    {new Date(fact.happened_at).toLocaleTimeString()}
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
