import { Alert, Badge, Box, Text, Tooltip, Wrap } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { RichTextViewer } from 'src/components/rich-text';
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
        {/* <Alert status='info' mt={2} mb={2}>
          <RichTextViewer content={item.content} />
        </Alert> */}
      </Box>
    </>
  );
};

export default TaskFeedItem;
