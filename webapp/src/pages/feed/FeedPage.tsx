import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Divider,
  useToast,
} from '@chakra-ui/react';
import { getFeed } from 'src/api/feed';
// import { FeedItem } from 'src/types/Feed';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
// import ObjectTypeFeedItem from './items/ObjectTypeFeedItem';
// import TaskFeedItem from './items/TaskFeedItem';
// import FunnelFeedItem from './items/FunnelFeedItem';
// import ObjectFeedItem from './items/ObjectFeedItem';
// import NewObjectTypeValue from './items/NewObjectTypeValue';
// import ObjectStepFeedItem from './items/ObjectStepFeedItem';
import LoadingPanel from 'src/components/LoadingPanel';
import FactItem from 'src/components/FactItem';
import { Fact } from 'src/types';

// const FeedItemSwitch = (data: any) => {
//   const response = data.details.response;
//   const method = data.details.method;
//   if (data.url === '/setting/data-types') {
//     return <ObjectTypeFeedItem item={response} />;
//   }
//   if (data.url === '/tasks' || data.url.match(/\/tasks\/\d+/)) {
//     return <TaskFeedItem item={response} method={method} />;
//   }
//   if (data.url === '/setting/funnels') {
//     return <FunnelFeedItem item={response} />;
//   }
//   if (data.url === '/objects' || data.url.match(/\/objects\/\d+/)) {
//     return <ObjectFeedItem item={response} method={method} />;
//   }
//   if (data.url.match(/\/objects\/\d+\/type-values/)) {
//     return <NewObjectTypeValue item={response} />;
//   }
//   if (data.url === '/objects/steps') {
//     return <ObjectStepFeedItem item={response} />;
//   }
//   return (
//     <VStack>
//       <Text>
//         {method} {response.name || response.title || 'Unknow'}
//       </Text>
//     </VStack>
//   );
// };

const FeedPage: React.FC = () => {
  const [feedItems, setFeedItems] = useState<Fact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const loadFeed = async () => {
    try {
      setIsLoading(true);
      const response = await getFeed();
      // change to list of facts for now
      setFeedItems(response.facts as Fact[]);
    } catch (error) {
      toast({
        title: 'Error fetching feed',
        description: 'Failed to load feed',
        status: 'error',
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  dayjs.extend(relativeTime);

  return (
    <Box>
      <Heading as='h1' size='xl' mb={6} color='var(--color-primary)'>
        Feed
      </Heading>
      {isLoading ? (
        <LoadingPanel />
      ) : (
        <VStack spacing={4} align='stretch'>
          {feedItems.length === 0 && (
            <Box>
              <Text mb={2}>
                Hurray, you caught up with the work. Nothing to display!
              </Text>
              <Divider />
            </Box>
          )}
          {feedItems.map((item) => {
            if (typeof item.happenedAt !== 'string') {
              console.log(item);
            }
            return (
              // <Box
              //   key={item.id}
              //   p={4}
              //   bg='white'
              //   borderRadius='md'
              //   boxShadow='sm'
              // >
              //   {FeedItemSwitch(item.content)}
              //   <Text fontSize='sm' color='gray.500' mt={2}>
              //     {dayjs(item.createdAt).fromNow()}
              //   </Text>
              // </Box>
              <FactItem key={item.id} fact={item as Fact} />
            );
          })}
        </VStack>
      )}
    </Box>
  );
};

export default FeedPage;
