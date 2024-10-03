import React from 'react';
import {
  Box,
  VStack,
  useDisclosure,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { Task, TaskStatus } from 'src/types/';
import { TaskForm } from 'src/components/forms/';
import TaskItem from 'src/components/TaskItem';

interface TaskPanelProps {
  objectId: string;
  tasks: Task[];
}

const TaskPanel: React.FC<TaskPanelProps> = ({ objectId, tasks }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const handleAddTask = async (newTask: Task) => {
    try {
      // const addedTask = await addTask(objectId, newTask);
      // setTasks([...tasks, addedTask]);
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
      // const updatedTask = await updateTaskStatus(taskId, newStatus);
      // setTasks(tasks.map((task) => (task.id === taskId ? updatedTask : task)));
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
      // const updatedTask = await reassignTask(taskId, newAssigneeId);
      // setTasks(tasks.map((task) => (task.id === taskId ? updatedTask : task)));
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
        {/* <ActionSuggestion
          objectId={objectId}
          onActionTaken={(data: any) => {
            console.log('data:', data);
          }}
        /> */}
        {tasks.filter((task) => task.status !== TaskStatus.COMPLETED).length >
        0 ? (
          tasks
            .filter((task) => task.status !== TaskStatus.COMPLETED)
            .map((task) => (
              <TaskItem key={task.id} task={task} handleClick={() => {}} />
            ))
        ) : (
          <Alert status='success'>
            <AlertIcon />
            All tasks completed!
          </Alert>
        )}
        {/* <Button onClick={onOpen}>Add New Task</Button> */}
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
