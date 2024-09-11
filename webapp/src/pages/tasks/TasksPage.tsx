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
import { Task, NewTask, TaskStatus } from '../../types/Task';
import { RichTextViewer } from '../../components/rich-text';

const ITEMS_PER_PAGE = 10;

interface TasksResponse {
  tasks: Task[];
  totalCount: number;
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

  useEffect(() => {
    fetchTasks();
  }, [currentPage, searchQuery, statusFilter]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      const response: TasksResponse = await mockFetchTasks(
        currentPage,
        searchQuery,
        statusFilter
      );
      setTasks(response.tasks);
      setTotalTasks(response.totalCount);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // TODO: Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false);
    }
  };

  // Mock API call - replace this with your actual API call
  const mockFetchTasks = async (
    page: number,
    query: string,
    status: TaskStatus | 'all'
  ): Promise<TasksResponse> => {
    // Simulating API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const allTasks: Task[] = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      content: `Task ${
        i + 1
      } description goes here. This is a sample task content that would be displayed using the Rich Text Viewer.`,
      status: Object.values(TaskStatus)[i % 4],
      dueDate: new Date(Date.now() + 86400000 * (i + 1))
        .toISOString()
        .split('T')[0],
      assignedTo: `user${i + 1}@example.com`,
    }));

    const filteredTasks = allTasks.filter((task) => {
      const matchesSearch =
        task.content.toLowerCase().includes(query.toLowerCase()) ||
        task.assignedTo.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === 'all' || task.status === status;
      return matchesSearch && matchesStatus;
    });

    const paginatedTasks = filteredTasks.slice(
      (page - 1) * ITEMS_PER_PAGE,
      page * ITEMS_PER_PAGE
    );

    return {
      tasks: paginatedTasks,
      totalCount: filteredTasks.length,
    };
  };

  const handleSaveTask = async (updatedTask: NewTask | Task) => {
    // TODO: Replace with actual API call to save task
    if ('id' in updatedTask) {
      setTasks(
        tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
    } else {
      const newTask: Task = { ...updatedTask, id: Date.now() };
      setTasks([...tasks, newTask]);
      setTotalTasks(totalTasks + 1);
    }
    onClose();
    setSelectedTask(null);
    await fetchTasks(); // Refresh the current page
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

  const totalPages = Math.ceil(totalTasks / ITEMS_PER_PAGE);

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
            {tasks.map((task) => (
              <Box
                key={task.id}
                p={4}
                bg='white'
                borderRadius='md'
                boxShadow='sm'
                onClick={() => handleEditTask(task)}
                cursor='pointer'
                _hover={{ boxShadow: 'md' }}
              >
                <HStack justify='space-between' mb={2}>
                  <Badge colorScheme={getStatusColor(task.status)}>
                    {task.status}
                  </Badge>
                  <Text fontSize='sm' color='gray.500'>
                    Due: {task.dueDate}
                  </Text>
                </HStack>
                <RichTextViewer content={task.content} />
                <Text fontSize='sm' color='gray.500' mt={2}>
                  Assigned to: {task.assignedTo}
                </Text>
              </Box>
            ))}
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
        task={selectedTask || undefined}
      />
    </Box>
  );
};

export default TasksPage;
