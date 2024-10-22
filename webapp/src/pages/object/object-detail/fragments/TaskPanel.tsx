import React from 'react';
import {
  Box,
  VStack,
  useDisclosure,
  Alert,
  AlertIcon,
  Button,
} from '@chakra-ui/react';
import { NewTask, Task, TaskStatus, UpdateTask } from 'src/types/';
import { TaskForm } from 'src/components/forms/';
import TaskItem from 'src/components/TaskItem';

interface TaskPanelProps {
  objectId: string;
  objectName: string;
  tasks: Task[];
  onAddTask: (task: NewTask) => void;
  onUpdateTask: (task: UpdateTask) => void;
  onDeleteTask: (taskId: string) => void;
}

const TaskPanel: React.FC<TaskPanelProps> = ({
  objectId,
  objectName,
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTask, setSelectedTask] = React.useState<Task | undefined>(
    undefined
  );

  const handleSaveTask = async (task: NewTask | UpdateTask) => {
    try {
      if ('id' in task) {
        await onUpdateTask(task as UpdateTask);
      } else {
        await onAddTask(task as NewTask);
      }
      onClose();
    } catch (error) {
    } finally {
      setSelectedTask(undefined);
    }
  };

  const handleDeleteTask = async (task: Task) => {
    await onDeleteTask(task.id);
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
        <Button onClick={onOpen}>Add New Task</Button>
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

export default TaskPanel;
