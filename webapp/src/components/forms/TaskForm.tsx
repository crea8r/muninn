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
} from '@chakra-ui/react';
import { TaskStatus, Task, NewTask, UpdateTask } from 'src/types/';
import MarkdownEditor from 'src/components/mardown/MardownEditor';
import dayjs from 'dayjs';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import { SpotLightFilter } from '../SpotLight';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: NewTask | UpdateTask) => void;
  initialTask?: Task;
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
  task: Task | undefined
): EditingTaskType => {
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
  initialTask,
}) => {
  const { globalData } = useGlobalContext();
  const [formData, setFormData] = useState<EditingTaskType>(
    converTaskToNewOrUpdateTask(initialTask)
  );
  const toast = useToast();
  useEffect(() => {
    const convertedTask = converTaskToNewOrUpdateTask(initialTask);
    setFormData(convertedTask);
  }, [initialTask, isOpen]);

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
              <Select
                name='assignedId'
                value={formData.assignedId || ''}
                onChange={handleInputChange}
                placeholder='Enter username or email'
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
              />
            </FormControl>
          </VStack>
          <HStack height={4} mt={3}>
            <Button colorScheme='gray' onClick={onClose}>
              Reset
            </Button>
            <Spacer />
            <Button colorScheme='blue' onClick={handleSave}>
              Submit
            </Button>
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default TaskForm;
