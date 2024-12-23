import { Badge, Box, HStack, Text } from '@chakra-ui/react';
import { Task, TaskStatus } from 'src/types';
import MarkdownDisplay from './mardown/MarkdownDisplay';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

type TaskItemProps = {
  task: Task;
  handleClick: (task: Task) => void;
};
const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.TODO:
      return 'gray';
    case TaskStatus.DOING:
      return 'blue';
    case TaskStatus.PAUSED:
      return 'orange';
    case TaskStatus.COMPLETED:
      return 'green';
  }
};
const TaskItem = ({ task, handleClick }: TaskItemProps) => {
  dayjs.extend(relativeTime);
  return (
    <Box
      key={task.id}
      p={4}
      bg='white'
      borderRadius='md'
      boxShadow='sm'
      onClick={() => handleClick(task)}
      cursor='pointer'
      _hover={{ boxShadow: 'md' }}
      borderColor={'gray.500'}
      borderWidth={0.3}
    >
      <HStack justify='space-between' mb={2}>
        <Badge colorScheme={getStatusColor(task.status)}>{task.status}</Badge>
        {task.deadline && (
          <Text fontSize='sm' color='gray.500'>
            Due: {dayjs(task.deadline).fromNow()}
          </Text>
        )}
      </HStack>
      <MarkdownDisplay content={task.content} characterLimit={200} />
      {task.assignedName && (
        <Text fontSize='sm' color='gray.500' mt={2}>
          Assigned to: {task.assignedName}
        </Text>
      )}
    </Box>
  );
};

export default TaskItem;
