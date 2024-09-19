import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
} from '@chakra-ui/react';
import { Task } from '../../types/';
import { fetchTasks, addTask, updateTaskStatus, reassignTask } from '../../api';
import { TaskForm } from '../forms/';
import ActionSuggestion from './ActionSuggestion';

interface TaskPanelProps {
  objectId: string;
}

const TaskPanel: React.FC<TaskPanelProps> = ({ objectId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const fetchedTasks = await fetchTasks(objectId);
        setTasks(fetchedTasks);
      } catch (error) {
        toast({
          title: 'Error loading tasks',
          description: 'Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    loadTasks();
  }, [objectId, toast]);

  const handleAddTask = async (newTask: Task) => {
    try {
      const addedTask = await addTask(objectId, newTask);
      setTasks([...tasks, addedTask]);
      onClose();
      toast({
        title: 'Task added',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error adding task',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      const updatedTask = await updateTaskStatus(taskId, newStatus);
      setTasks(tasks.map((task) => (task.id === taskId ? updatedTask : task)));
      toast({
        title: 'Task status updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error updating task status',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleReassignTask = async (taskId: number, newAssigneeId: number) => {
    try {
      const updatedTask = await reassignTask(taskId, newAssigneeId);
      setTasks(tasks.map((task) => (task.id === taskId ? updatedTask : task)));
      toast({
        title: 'Task reassigned',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error reassigning task',
        description: 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <VStack align='stretch' spacing={4}>
        <Heading size='md'>Tasks</Heading>
        <ActionSuggestion
          objectId={objectId}
          onActionTaken={(data: any) => {
            console.log('data:', data);
          }}
        />
        {tasks.map((task) => (
          <Box key={task.id} borderWidth={1} borderRadius='md' p={4}>
            <Text fontWeight='bold'>{task.content}</Text>
            <FormControl mt={2}>
              <FormLabel>Status</FormLabel>
              <Select
                value={task.status}
                onChange={(e) =>
                  handleUpdateTaskStatus(task.id, e.target.value)
                }
              >
                <option value='todo'>To Do</option>
                <option value='doing'>Doing</option>
                <option value='paused'>Paused</option>
                <option value='completed'>Completed</option>
              </Select>
            </FormControl>
            <FormControl mt={2}>
              <FormLabel>Assigned To</FormLabel>
              <Input
                value={task.assignedTo}
                onChange={(e) =>
                  handleReassignTask(task.id, parseInt(e.target.value))
                }
              />
            </FormControl>
          </Box>
        ))}
        <Button onClick={onOpen}>Add New Task</Button>
      </VStack>

      <TaskForm
        onSave={() => handleAddTask}
        onClose={onClose}
        isOpen={isOpen}
      />
    </Box>
  );
};

export default TaskPanel;
