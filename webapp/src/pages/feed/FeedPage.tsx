import React, { useEffect, useState } from 'react';
import { Box, VStack, Heading, Text, Divider } from '@chakra-ui/react';

interface FeedItem {
  id: number;
  content: string;
  date: string;
}

const FeedPage: React.FC = () => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    // TODO: Fetch actual feed data from API
    const mockFeedItems: FeedItem[] = [
      {
        id: 1,
        content: 'New task assigned: Review project proposal',
        date: '2024-08-29',
      },
      {
        id: 2,
        content: 'Object updated: Client meeting scheduled',
        date: '2024-08-28',
      },
      {
        id: 3,
        content: 'New comment on task: Finalize Q3 report',
        date: '2024-08-27',
      },
    ];
    setFeedItems(mockFeedItems);
  }, []);

  return (
    <Box>
      <Heading as='h1' size='xl' mb={6} color='var(--color-primary)'>
        Feed
      </Heading>
      <VStack spacing={4} align='stretch'>
        {feedItems.map((item) => (
          <Box key={item.id} p={4} bg='white' borderRadius='md' boxShadow='sm'>
            <Text>{item.content}</Text>
            <Text fontSize='sm' color='gray.500' mt={2}>
              {item.date}
            </Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default FeedPage;
