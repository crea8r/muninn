import React, { useState, useEffect } from 'react';
import {
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
  VStack,
  Box,
  useToast,
} from '@chakra-ui/react';
import { TaskStatus, Task, NewTask, UpdateTask } from 'src/types/';
import { RichTextEditor } from 'src/components/rich-text';
import dayjs from 'dayjs';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: NewTask | UpdateTask) => void;
  intialTask?: Task;
}

const converTaskToNewOrUpdateTask = (
  task: Task | undefined
): NewTask | UpdateTask => {
  if (!task) {
    // new task
    return {
      content: '',
      status: TaskStatus.TODO,
      objectIds: [],
    };
  } else {
    const tmp = structuredClone(task);
    delete tmp.objects;
    delete tmp.creatorName;
    delete tmp.assignedName;
    delete tmp.lastUpdated;
    return {
      ...tmp,
      objectIds:
        task && task.objects && task.objects.length > 0
          ? task.objects.map((obj) => obj.id)
          : [],
    };
  }
};

const TaskForm: React.FC<TaskFormProps> = ({
  isOpen,
  onClose,
  onSave,
  intialTask,
}) => {
  const [formData, setFormData] = useState<NewTask | UpdateTask>(
    converTaskToNewOrUpdateTask(intialTask)
  );
  const toast = useToast();
  useEffect(() => {
    const convertedTask = converTaskToNewOrUpdateTask(intialTask);
    setFormData(convertedTask);
  }, [intialTask, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    let { name, value } = e.target;
    if (name === 'deadline') {
      const dl = dayjs(value);
      if (dl.isBefore(dayjs())) {
        toast({
          title: 'Invalid Date',
          description: 'Please select a future date',
          status: 'error',
          duration: 1000,
          isClosable: true,
        });
        value = '';
      }
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateOrUpdateTask = async (
    updatedTask: NewTask | UpdateTask
  ) => {
    updatedTask.deadline = updatedTask.deadline
      ? dayjs(updatedTask.deadline).toISOString()
      : undefined;
    try {
      await onSave(
        intialTask ? { ...updatedTask, id: intialTask.id } : updatedTask
      );
      toast({
        title: 'Task saved successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onClose();
    } catch (e: any) {
      toast({
        title: 'Error saving task',
        description: e.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSave = (textContent: any) => {
    const updatedTask = {
      ...formData,
      content: textContent.content,
      objectIds: textContent.relatedObjects || [],
    };
    handleCreateOrUpdateTask(updatedTask);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='xl'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {intialTask ? 'Edit Task' : 'Create New Task'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Status</FormLabel>
              <Select
                name='status'
                value={formData.status}
                onChange={handleInputChange}
              >
                {Object.values(TaskStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Due Date</FormLabel>
              <Input
                type='datetime-local'
                name='deadline'
                value={dayjs(formData.deadline).format('YYYY-MM-DDTHH:mm')}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Assigned To</FormLabel>
              <Input
                name='assignedTo'
                value={formData.assignedId}
                onChange={handleInputChange}
                placeholder='Enter username or email'
              />
            </FormControl>
            <FormControl>
              <FormLabel>Task Description</FormLabel>
              <RichTextEditor
                initialValue={formData.content}
                onSave={handleSave}
              />
            </FormControl>
          </VStack>
          <Box height={4} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default TaskForm;
