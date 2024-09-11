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
} from '@chakra-ui/react';
import { TaskStatus, Task, NewTask } from 'src/types/';
import { RichTextEditor } from 'src/components/rich-text';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: NewTask | Task) => void;
  task?: Task;
}

const TaskForm: React.FC<TaskFormProps> = ({
  isOpen,
  onClose,
  onSave,
  task,
}) => {
  const [formData, setFormData] = useState<NewTask>({
    content: '',
    status: TaskStatus.TODO,
    dueDate: '',
    assignedTo: '',
  });

  useEffect(() => {
    if (task) {
      setFormData(task);
    } else {
      setFormData({
        content: '',
        status: TaskStatus.TODO,
        dueDate: '',
        assignedTo: '',
      });
    }
  }, [task, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (content: any) => {
    // const updatedTask = { ...formData, content };
    // onSave(task ? { ...updatedTask, id: task.id } : updatedTask);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='xl'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{task ? 'Edit Task' : 'Create New Task'}</ModalHeader>
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
                type='date'
                name='dueDate'
                value={formData.dueDate}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Assigned To</FormLabel>
              <Input
                name='assignedTo'
                value={formData.assignedTo}
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
