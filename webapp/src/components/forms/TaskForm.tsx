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
  useToast,
  HStack,
  Button,
  Spacer,
  Spinner,
} from '@chakra-ui/react';
import { TaskStatus, Task, NewTask, UpdateTask } from 'src/types/';
import MarkdownEditor from 'src/components/mardown/MardownEditor';
import dayjs from 'dayjs';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import { SpotLightFilter } from '../spot-light/SpotLight';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: NewTask | UpdateTask) => void;
  onDelete?: (task: Task) => void;
  initialTask?: Task;
  defaultContent?: string;
}

interface EditingTaskType {
  id?: string;
  content: string;
  status: TaskStatus;
  deadline?: string;
  assignedId?: string;
  objectIds: string[];
}

const converTaskToNewOrUpdateTask = (
  task: Task | undefined,
  defaultContent: string | undefined
): EditingTaskType => {
  if (!task) {
    // new task
    return {
      content: defaultContent ? defaultContent : '',
      status: TaskStatus.TODO,
      deadline: dayjs().add(1, 'day').toISOString(),
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
  onDelete,
  initialTask,
  defaultContent,
}) => {
  const { globalData } = useGlobalContext();
  const [formData, setFormData] = useState<EditingTaskType>(
    converTaskToNewOrUpdateTask(initialTask, defaultContent)
  );
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const convertedTask = converTaskToNewOrUpdateTask(
      initialTask,
      defaultContent
    );
    setFormData(convertedTask);
  }, [initialTask, isOpen, defaultContent]);

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
    setIsLoading(true);
    try {
      await onSave(
        initialTask ? { ...updatedTask, id: initialTask.id } : updatedTask
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    const cfm = window.confirm('Are you sure you want to delete this task?');
    if (!cfm) return;
    if (initialTask && onDelete) {
      setIsLoading(true);
      try {
        await onDelete(initialTask);
        onClose();
      } catch (e: any) {
        toast({
          title: 'Error deleting task',
          description: typeof e === 'string' ? e : 'Cannot delete task',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSave = () => {
    const relatedObjectIds = formData.objectIds || [];
    const exisitingObjectIds = initialTask?.objects?.map((obj) => obj.id) || [];
    const toAddObjectIds = relatedObjectIds.filter(
      (id: string) => !exisitingObjectIds.includes(id)
    );
    const toRemoveObjectIds = exisitingObjectIds.filter(
      (id: string) => !relatedObjectIds.includes(id)
    );
    const content =
      typeof formData.content === 'object'
        ? JSON.stringify(formData.content)
        : formData.content;
    const toSubmitTask = {
      ...formData,
      content,
      toAddObjectIds: toAddObjectIds,
      toRemoveObjectIds: toRemoveObjectIds,
    };
    handleCreateOrUpdateTask(toSubmitTask);
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} size='xl'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {initialTask ? 'Edit Task' : 'Create New Task'}
          {isLoading && <Spinner size='sm' ml={2} />}
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
                isDisabled={isLoading}
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
                isDisabled={isLoading}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Assigned To</FormLabel>
              <Select
                name='assignedId'
                value={formData.assignedId || ''}
                onChange={handleInputChange}
                placeholder='Enter username or email'
                isDisabled={isLoading}
              >
                {globalData &&
                  globalData.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.username} ({member.profile.email})
                    </option>
                  ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Task Description</FormLabel>
              <MarkdownEditor
                initialValue={formData.content}
                filters={[SpotLightFilter.OBJECT]}
                onChange={(content: string, relatedItems: any) => {
                  try {
                    const jsonContent = JSON.parse(content);
                    setFormData((prev) => ({
                      ...prev,
                      content: jsonContent,
                    }));
                  } catch (e) {
                    setFormData((prev) => ({ ...prev, content: content }));
                  }
                  let objIds = relatedItems
                    ? relatedItems.map((item: any) => item.payload.id)
                    : [];
                  setFormData((prev) => ({ ...prev, objectIds: objIds }));
                }}
                isDisabled={isLoading}
              />
            </FormControl>
          </VStack>
          <HStack height={4} mt={3}>
            <Button colorScheme='gray' onClick={onClose} isDisabled={isLoading}>
              Reset
            </Button>
            <Spacer />
            {initialTask && (
              <Button
                colorScheme='red'
                onClick={handleDelete}
                isDisabled={isLoading}
              >
                Delete
              </Button>
            )}

            <Button
              colorScheme='blue'
              onClick={handleSave}
              isDisabled={isLoading}
            >
              Submit
            </Button>
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default TaskForm;
