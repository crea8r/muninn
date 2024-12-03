// src/types/automation.ts
import { CoreFilterConfig } from 'src/types/FilterConfig';
import { ListResponse } from '.';

export interface AutomatedAction {
  id: string;
  name: string;
  description: string;
  filterConfig: CoreFilterConfig;
  actionConfig: ActionConfig;
  isActive: boolean;
  lastRunAt: string | null;
  createdAt: string;
  createdBy: string;
  lastExecution?: ExecutionSummary;
}
// TODO: change to only 1 tag
export interface ActionConfig {
  tagId?: string;
  funnelId?: string;
}

export interface ExecutionSummary {
  id: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  objectsProcessed: number;
  objectsAffected: number;
  errorMessage?: string;
}

export interface ExecutionLogEntry {
  id: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  objectsProcessed: number;
  objectsAffected: number;
  errorMessage?: string;
  executionLog: any;
}

export type AutomationListResponse = ListResponse<AutomatedAction>;
export type ExecutionListResponse = ListResponse<ExecutionLogEntry>;

export interface CreateAutomationDTO {
  name: string;
  description: string;
  filterConfig: CoreFilterConfig;
  actionConfig: ActionConfig;
  isActive: boolean;
}
