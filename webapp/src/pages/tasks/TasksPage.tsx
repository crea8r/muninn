import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Button,
  HStack,
  useDisclosure,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Checkbox,
  CheckboxGroup,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { TaskForm } from 'src/components/forms';
import { Task, NewTask, TaskStatus, UpdateTask } from 'src/types/Task';
import { createTask, deleteTask, listTasks, updateTask } from 'src/api';
import authService from 'src/services/authService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import TaskItem from 'src/components/TaskItem';
import LoadingPanel from 'src/components/LoadingPanel';

const ITEMS_PER_PAGE = 20;

interface TasksResponse {
  tasks: Task[];
  totalCount: number;
  page: number;
  pageSize: number;
}

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([
    TaskStatus.TODO,
    TaskStatus.DOING,
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceUpdate, currentPage, searchQuery, statusFilter]);

  const fetchTasks = async () => {
    const status = statusFilter.join(',');
    const options = {
      page: currentPage,
      pageSize: ITEMS_PER_PAGE,
      search: searchQuery,
      status,
      creatorId: authService.getCreatorId() || '',
      assignedId: authService.getCreatorId() || '',
    };
    setIsLoading(true);
    try {
      const response: TasksResponse = await listTasks(options);
      setTasks(response.tasks);
      setTotalTasks(response.totalCount);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // TODO: Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTask = async (task: NewTask | UpdateTask) => {
    if (!selectedTask) {
      // create new
      task.creatorId = authService.getCreatorId() || '';
      await createTask(task as NewTask);
      setForceUpdate(forceUpdate + 1);
    } else {
      await updateTask(selectedTask.id, task as UpdateTask);
      setForceUpdate(forceUpdate + 1);
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    onOpen();
  };

  const handleDeleteTask = async (task: Task) => {
    if (task) {
      await deleteTask(task.id);
      setForceUpdate(forceUpdate + 1);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleStatusFilterChange = (values: TaskStatus[]) => {
    setStatusFilter(values);
    setCurrentPage(1); // Reset to first page on new filter
  };

  const totalPages = Math.ceil(totalTasks / ITEMS_PER_PAGE);
  dayjs.extend(relativeTime);

  return (
    <Box height='100%' display='flex' flexDirection='column'>
      <Box flexShrink={0}>
        <HStack justify='space-between' mb={6}>
          <Heading as='h1' size='xl' color='var(--color-primary)'>
            Tasks
          </Heading>
          <Button
            colorScheme='blue'
            onClick={() => {
              setSelectedTask(null);
              onOpen();
            }}
            isDisabled={isLoading}
          >
            New Task
          </Button>
        </HStack>
        <InputGroup>
          <InputLeftElement pointerEvents='none'>
            <SearchIcon color='gray.300' />
          </InputLeftElement>
          <Input
            placeholder='Search tasks...'
            value={searchQuery}
            onChange={handleSearchChange}
            isDisabled={isLoading}
          />
        </InputGroup>
        <HStack alignItems={'center'} my={2} pl={2}>
          <CheckboxGroup
            colorScheme='blue'
            defaultValue={[TaskStatus.TODO, TaskStatus.DOING]}
            onChange={handleStatusFilterChange}
          >
            <HStack alignItems='flex-start'>
              {Object.values(TaskStatus).map((status) => (
                <Checkbox key={status} value={status} isDisabled={isLoading}>
                  {status}
                </Checkbox>
              ))}
            </HStack>
          </CheckboxGroup>
        </HStack>
      </Box>

      {isLoading ? (
        <LoadingPanel />
      ) : (
        <>
          <Box flexGrow={1} overflowY='auto'>
            <VStack spacing={4} align='stretch'>
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    handleClick={handleEditTask}
                  />
                ))
              ) : (
                <Flex justify='center' align='center' height='100%'>
                  <Box>No tasks found</Box>
                </Flex>
              )}
            </VStack>
          </Box>

          <Flex
            justifyContent='space-between'
            alignItems='center'
            mt={4}
            flexShrink={0}
          >
            <Box>
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, totalTasks)} of{' '}
              {totalTasks} tasks
            </Box>
            <HStack>
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || isLoading}
              >
                Previous
              </Button>
              <Button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || isLoading}
              >
                Next
              </Button>
            </HStack>
          </Flex>
        </>
      )}

      <TaskForm
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setSelectedTask(null);
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        initialTask={selectedTask || undefined}
      />
    </Box>
  );
};

export default TasksPage;
