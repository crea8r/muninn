import React, { useState } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
} from '@chakra-ui/react';
import { NewTask, TaskStatus } from '../types/Task';
import RichTextEditor from './RichTextEditor';

interface TaskFormProps {
  onSave: (task: NewTask) => void;
  onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSave, onClose }) => {
  const [task, setTask] = useState<NewTask>({
    content: '',
    status: TaskStatus.TODO,
    dueDate: '',
    assignedTo: '',
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setTask((prevTask) => ({ ...prevTask, [name]: value }));
  };

  const handleContentChange = (content: string) => {
    console.log('Content changed:', content);
    setTask((prevTask) => ({ ...prevTask, content }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(task);
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Task Description</FormLabel>
          <RichTextEditor
            onSave={handleContentChange}
            initialValue={task.content}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Status</FormLabel>
          <Select name='status' value={task.status} onChange={handleChange}>
            <option value='todo'>To Do</option>
            <option value='doing'>Doing</option>
            <option value='paused'>Paused</option>
            <option value='completed'>Completed</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Due Date</FormLabel>
          <Input
            type='date'
            name='dueDate'
            value={task.dueDate}
            onChange={handleChange}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Assigned To</FormLabel>
          <Input
            name='assignedTo'
            value={task.assignedTo}
            onChange={handleChange}
            placeholder="Enter assignee's name"
          />
        </FormControl>
        <Button type='submit' colorScheme='blue'>
          Save Task
        </Button>
      </VStack>
    </form>
  );
};

export default TaskForm;
