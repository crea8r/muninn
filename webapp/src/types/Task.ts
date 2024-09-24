export enum TaskStatus {
  TODO = 'todo',
  DOING = 'doing',
  PAUSED = 'paused',
  COMPLETED = 'completed',
}

export interface Task {
  id: any;
  content: string;
  parentId?: string;
  objects?: {
    id: string;
    name: string;
    description: string;
  }[];
  status: TaskStatus;
  // time sensitivity
  deadline?: string;
  remindAt?: string;
  lastUpdated?: string;
  // assigneed
  assignedId?: string;
  assignedName?: string;
  // creator
  creatorId?: string;
  creatorName?: string;
}

export interface NewTask {
  content: string;
  parentId?: string;
  status: TaskStatus;
  creatorId?: string;
  objectIds: string[];
  // time sensitivity
  deadline?: string;
  remindAt?: string;
  // assigneed
  assignedId?: string;
}

export interface UpdateTask {
  id: string;
  content: string;
  status: string;
  parentId: string;
  creatorId: string;
  toAddObjectIds: string[];
  toRemoveObjectIds: string[];
  // time sensitivity
  deadline: string;
  remindAt: string;
  // assigneed
  assignedId: string;
}
