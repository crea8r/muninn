import { Task, NewTask, UpdateTask } from 'src/types';
import { axiosWithAuth } from './utils';

const API_URL = process.env.REACT_APP_API_URL;

export interface ListTasksResponse {
  tasks: Task[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export const createTask = async (newTask: NewTask): Promise<Task> => {
  const response = await axiosWithAuth().post(`${API_URL}/tasks`, newTask);
  return response.data;
};

export const updateTask = async (
  taskId: string,
  updateData: UpdateTask
): Promise<Task> => {
  const response = await axiosWithAuth().put(
    `${API_URL}/tasks/${taskId}`,
    updateData
  );
  return response.data;
};

export const deleteTask = async (taskId: string): Promise<void> => {
  await axiosWithAuth().delete(`${API_URL}/tasks/${taskId}`);
};

export interface ListTasksOptions {
  page: number;
  pageSize: number;
  query: string;
  status: string;
  creatorId: string;
  assignedId: string;
}

export const listTasks = async ({
  page = 1,
  pageSize = 20,
  query = '',
  status = '',
  creatorId = '',
  assignedId = '',
}: ListTasksOptions): Promise<ListTasksResponse> => {
  const response = await axiosWithAuth().get(`${API_URL}/tasks`, {
    params: { page, pageSize, query, status, creatorId, assignedId },
  });
  return response.data;
};

export const getTaskById = async (taskId: string): Promise<Task> => {
  const response = await axiosWithAuth().get(`${API_URL}/tasks/${taskId}`);
  return response.data;
};

export interface TaskWithObjects extends Task {
  objects: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

export const getTaskWithObjects = async (
  taskId: string
): Promise<TaskWithObjects> => {
  const response = await axiosWithAuth().get(`${API_URL}/tasks/${taskId}`);
  return response.data;
};
