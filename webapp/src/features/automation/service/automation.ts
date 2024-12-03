// src/api/automation.ts
import { axiosWithAuth } from 'src/api/utils';
import {
  AutomationListResponse,
  AutomatedAction,
  ExecutionListResponse,
} from 'src/types/Automation';

const API_URL = process.env.REACT_APP_API_URL;

const api = {
  listAutomations: async (
    page: number,
    pageSize: number,
    search?: string
  ): Promise<AutomationListResponse> => {
    const response = await axiosWithAuth().get(`${API_URL}/automations`, {
      params: { page, pageSize, q: search },
    });
    return response.data;
  },
  getExecutionLogs: async (
    actionId: string,
    page: number,
    pageSize: number
  ): Promise<ExecutionListResponse> => {
    const response = await axiosWithAuth().get(
      `${API_URL}/automations/${actionId}/executions`,
      {
        params: { page, pageSize },
      }
    );
    return response.data;
  },
  deleteAutomation: async (actionId: string): Promise<void> => {
    await axiosWithAuth().delete(`${API_URL}/automations/${actionId}`);
  },
  updateAutomation: async (
    actionId: string,
    data: Partial<AutomatedAction>
  ): Promise<AutomatedAction> => {
    const response = await axiosWithAuth().put(
      `${API_URL}/automations/${actionId}`,
      data
    );
    return response.data;
  },
  createAutomation: async (
    data: Partial<AutomatedAction>
  ): Promise<AutomatedAction> => {
    const response = await axiosWithAuth().post(`${API_URL}/automations`, data);
    return response.data;
  },
};

export default api;
