import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  HStack,
  Badge,
  useDisclosure,
  Flex,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import BreadcrumbComponent from '../../components/Breadcrumb';
import { TaskForm } from '../../components/forms';
import { Task, NewTask, TaskStatus, UpdateTask } from '../../types/Task';
import { RichTextViewer } from '../../components/rich-text';
import { createTask, listTasks, updateTask } from 'src/api';
import authService from 'src/services/authService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import TaskItem from 'src/components/TaskItem';

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
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    fetchTasks();
  }, [forceUpdate, currentPage, searchQuery, statusFilter]);

  const fetchTasks = async () => {
    const status = statusFilter === 'all' ? '' : statusFilter.toString();
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStatusFilter(e.target.value as TaskStatus | 'all');
    setCurrentPage(1); // Reset to first page on new filter
  };

  const totalPages = Math.ceil(totalTasks / ITEMS_PER_PAGE);
  dayjs.extend(relativeTime);

  return (
    <Box height='100%' display='flex' flexDirection='column'>
      <Box flexShrink={0}>
        <BreadcrumbComponent />
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
          >
            New Task
          </Button>
        </HStack>
        <HStack spacing={4} mb={4}>
          <InputGroup>
            <InputLeftElement pointerEvents='none'>
              <SearchIcon color='gray.300' />
            </InputLeftElement>
            <Input
              placeholder='Search tasks...'
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </InputGroup>
          <Select value={statusFilter} onChange={handleStatusFilterChange}>
            <option value='all'>All Statuses</option>
            {Object.values(TaskStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </HStack>
      </Box>

      <Box flexGrow={1} overflowY='auto'>
        {isLoading ? (
          <Flex justify='center' align='center' height='100%'>
            <Spinner />
          </Flex>
        ) : (
          <VStack spacing={4} align='stretch'>
            {tasks.length > 0 ? (
              tasks.map((task) => {
                return (
                  <TaskItem
                    key={task.id}
                    task={task}
                    handleClick={handleEditTask}
                  />
                );
              })
            ) : (
              <Flex justify='center' align='center' height='100%'>
                <Box>No tasks found</Box>
              </Flex>
            )}
          </VStack>
        )}
      </Box>

      <Flex
        justifyContent='space-between'
        alignItems='center'
        mt={4}
        flexShrink={0}
      >
        <Box>
          Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
          {Math.min(currentPage * ITEMS_PER_PAGE, totalTasks)} of {totalTasks}{' '}
          tasks
        </Box>
        <HStack>
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || isLoading}
          >
            Previous
          </Button>
          <Select
            value={currentPage}
            onChange={(e) => setCurrentPage(Number(e.target.value))}
            disabled={isLoading}
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <option key={page} value={page}>
                Page {page}
              </option>
            ))}
          </Select>
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

      <TaskForm
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setSelectedTask(null);
        }}
        onSave={handleSaveTask}
        initialTask={selectedTask || undefined}
      />
    </Box>
  );
};

export default TasksPage;
