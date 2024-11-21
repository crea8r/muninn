import React from 'react';
import { Box, VStack, useDisclosure, Alert, AlertIcon } from '@chakra-ui/react';
import { NewTask, Task, TaskStatus, UpdateTask } from 'src/types/';
import { TaskForm } from 'src/components/forms/';
import TaskItem from 'src/components/TaskItem';
import { useObjectDetail } from '../contexts/ObjectDetailContext';
import { createTask, deleteTask, updateTask } from 'src/api';
import { FaPlus } from 'react-icons/fa';

export const TaskPanel: React.FC = () => {
  const { object } = useObjectDetail();
  const tasks = object?.tasks || [];
  const objectName = object?.name;
  const objectId = object?.id;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTask, setSelectedTask] = React.useState<Task | undefined>(
    undefined
  );

  const handleSaveTask = async (task: NewTask | UpdateTask) => {
    try {
      if ('id' in task) {
        await updateTask(task.id, task as UpdateTask);
      } else {
        await createTask(task as NewTask);
      }
      onClose();
    } catch (error) {
    } finally {
      setSelectedTask(undefined);
    }
  };

  const handleDeleteTask = async (task: Task) => {
    await deleteTask(task.id);
    onClose();
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
              <TaskItem
                key={task.id}
                task={task}
                handleClick={() => {
                  setSelectedTask(task);
                  onOpen();
                }}
              />
            ))
        ) : (
          <Alert status='success'>
            <AlertIcon />
            All tasks completed!
          </Alert>
        )}
      </VStack>

      <TaskForm
        onSave={handleSaveTask}
        onClose={onClose}
        isOpen={isOpen}
        initialTask={selectedTask}
        defaultContent={`@[${objectName}](object:${objectId})`}
        onDelete={handleDeleteTask}
      />
    </Box>
  );
};

export const CreateTaskButton: React.FC = () => {
  const { object, refresh } = useObjectDetail();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const objectId = object?.id;
  const objectName = object?.name;
  const handleSaveTask = async (task: NewTask | UpdateTask) => {
    try {
      await createTask(task as NewTask);
      onClose();
      refresh();
    } catch (error) {
    } finally {
    }
  };
  return (
    <>
      <FaPlus onClick={onOpen} />
      <TaskForm
        onSave={handleSaveTask}
        onClose={onClose}
        isOpen={isOpen}
        defaultContent={`@[${objectName}](object:${objectId})`}
      />
    </>
  );
};
