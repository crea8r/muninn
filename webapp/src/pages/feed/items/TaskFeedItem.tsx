import { Box, Text } from '@chakra-ui/react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

const TaskFeedItem: React.FC<{ item: any; method: string }> = ({
  item,
  method,
}) => {
  dayjs.extend(relativeTime);
  return (
    <>
      <Box mb={2}>
        <Text>
          {method === 'POST' ? 'New' : 'Edit'} TASK,{' '}
          {item.deadline && <>deadline: {dayjs(item.deadline).fromNow()}</>}
        </Text>
      </Box>
    </>
  );
};

export default TaskFeedItem;
