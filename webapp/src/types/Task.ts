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
  // delete
  deletedAt?: string;
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
// Content   string    `json:"content"`
// 	Deadline  time.Time `json:"deadline"`
// 	RemindAt  time.Time `json:"remindAt"`
// 	Status    string    `json:"status"`
// 	AssignedID uuid.UUID `json:"assignedId"`
// 	ParentID  uuid.UUID `json:"parentId"`
// 	ToAddObjectIDs []uuid.UUID `json:"toAddObjectIds"`
// 	ToRemoveObjectIDs []uuid.UUID `json:"toRemoveObjectIds"`
export interface UpdateTask {
  id: string;
  content: string;
  // time sensitivity
  deadline: string;
  remindAt: string;
  status: string;
  // assigneed
  assignedId: string;
  parentId: string;
  creatorId: string;
  toAddObjectIds: string[];
  toRemoveObjectIds: string[];
}
