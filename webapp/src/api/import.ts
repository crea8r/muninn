import { FactToCreate } from './fact';
import { axiosWithAuth } from './utils';
const axios = axiosWithAuth();

const API_URL = process.env.REACT_APP_API_URL;

export interface ImportRequest {
  obj_type_id: string;
  file_name: string;
  rows: Array<{
    id_string: string;
    values: Record<string, string>;
    fact: FactToCreate;
  }>;
  tags: string[];
}

export interface ImportTask {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  total_rows: number;
  processed_rows: number;
  error_message?: string;
  result_summary?: any;
  file_name: string;
  created_at: string;
}

export const initiateImport = async (
  importData: ImportRequest
): Promise<string> => {
  const response = await axios.post(`${API_URL}/import`, importData);
  return response.data.task_id;
};

export const getImportTaskStatus = async (
  taskId: string
): Promise<ImportTask> => {
  const response = await axios.get(`${API_URL}/import/status`, {
    params: { task_id: taskId },
  });
  return response.data;
};

export interface ImportHistoryResponse {
  tasks: ImportTask[];
  total_count: number;
  page: number;
  page_size: number;
}

export const getImportHistory = async (
  page: number = 1,
  pageSize: number = 10
): Promise<ImportHistoryResponse> => {
  const response = await axios.get(`${API_URL}/import/history`, {
    params: { page, page_size: pageSize },
  });
  return response.data;
};
