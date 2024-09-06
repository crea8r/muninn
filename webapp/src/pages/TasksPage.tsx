import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  HStack,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import BreadcrumbComponent from '../components/Breadcrumb';
import TaskForm from '../components/TaskForm';
import { Task, NewTask, TaskStatus } from '../types/Task';
import RichTextViewer from '../components/RichTextViewer';

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    // TODO: Fetch tasks from API
    const dummyTasks: Task[] = [
      {
        id: 1,
        content: 'Finish project proposal',
        status: TaskStatus.DOING,
        dueDate: '2023-06-01',
        assignedTo: 'John Doe',
      },
      {
        id: 2,
        content: 'Review client feedback',
        status: TaskStatus.TODO,
        dueDate: '2023-06-05',
        assignedTo: 'Jane Smith',
      },
      {
        id: 3,
        content: 'Update website content',
        status: TaskStatus.COMPLETED,
        dueDate: '2023-05-30',
        assignedTo: 'Mike Johnson',
      },
    ];
    setTasks(dummyTasks);
  }, []);

  const handleSaveTask = (newTask: NewTask) => {
    // TODO: Send new task to API
    const taskWithId: Task = {
      ...newTask,
      id: tasks.length + 1, // This is a temporary ID. In a real app, the ID would come from the backend.
    };
    setTasks([...tasks, taskWithId]);
    onClose();
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return 'gray';
      case 'doing':
        return 'blue';
      case 'paused':
        return 'orange';
      case 'completed':
        return 'green';
    }
  };

  return (
    <Box>
      <BreadcrumbComponent />
      <HStack justify='space-between' mb={6}>
        <Heading as='h1' size='xl' color='var(--color-primary)'>
          Tasks
        </Heading>
        <Button colorScheme='blue' onClick={onOpen}>
          New Task
        </Button>
      </HStack>
      <VStack spacing={4} align='stretch'>
        {tasks.map((task) => (
          <Box key={task.id} p={4} bg='white' borderRadius='md' boxShadow='sm'>
            <HStack justify='space-between'>
              <RichTextViewer content={task.content} />
              <Badge colorScheme={getStatusColor(task.status)}>
                {task.status}
              </Badge>
            </HStack>
            <Text fontSize='sm' color='gray.500' mt={2}>
              Due: {task.dueDate}
            </Text>
            <Text fontSize='sm' color='gray.500'>
              Assigned to: {task.assignedTo}
            </Text>
          </Box>
        ))}
      </VStack>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New Task</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <TaskForm onSave={handleSaveTask} onClose={onClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TasksPage;
