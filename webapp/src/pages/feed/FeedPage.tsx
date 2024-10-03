import React, { useEffect, useState } from 'react';
import { Box, VStack, Heading, Text, Divider } from '@chakra-ui/react';
import { getFeed } from 'src/api/feed';
import { FeedItem } from 'src/types/Feed';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import ObjectTypeFeedItem from './items/ObjectTypeFeedItem';
import TaskFeedItem from './items/TaskFeedItem';
import FunnelFeedItem from './items/FunnelFeedItem';
import ObjectFeedItem from './items/ObjectFeedItem';
import NewObjectTypeValue from './items/NewObjectTypeValue';
import ObjectStepFeedItem from './items/ObjectStepFeedItem';

const FeedItemSwitch = (data: any) => {
  const response = data.details.response;
  const method = data.details.method;
  if (data.url === '/setting/object-types') {
    return <ObjectTypeFeedItem item={response} />;
  }
  if (data.url === '/tasks' || data.url.match(/\/tasks\/\d+/)) {
    return <TaskFeedItem item={response} method={method} />;
  }
  if (data.url === '/setting/funnels') {
    return <FunnelFeedItem item={response} />;
  }
  if (data.url === '/objects' || data.url.match(/\/objects\/\d+/)) {
    return <ObjectFeedItem item={response} method={method} />;
  }
  if (data.url.match(/\/objects\/\d+\/type-values/)) {
    return <NewObjectTypeValue item={response} />;
  }
  if (data.url === '/objects/steps') {
    return <ObjectStepFeedItem item={response} />;
  }
  return (
    <VStack>
      <Text>
        {method} {response.name || response.title || 'Unknow'}
      </Text>
    </VStack>
  );
};

const FeedPage: React.FC = () => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const loadFeed = async () => {
    try {
      const feed = await getFeed();
      setFeedItems(feed);
    } catch (error) {
      console.error('Error loading feed:', error);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);
  dayjs.extend(relativeTime);

  return (
    <Box>
      <Heading as='h1' size='xl' mb={6} color='var(--color-primary)'>
        Feed
      </Heading>
      <VStack spacing={4} align='stretch'>
        {feedItems.length === 0 && (
          <Box>
            <Text>
              Hurray, you caught up with the work. Nothing to display!
            </Text>
            <Divider />
          </Box>
        )}
        {feedItems.map((item) => {
          return (
            <Box
              key={item.id}
              p={4}
              bg='white'
              borderRadius='md'
              boxShadow='sm'
            >
              {FeedItemSwitch(item.content)}
              <Text fontSize='sm' color='gray.500' mt={2}>
                {dayjs(item.createdAt).fromNow()}
              </Text>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};

export default FeedPage;
