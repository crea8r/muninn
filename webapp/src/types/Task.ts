export enum TaskStatus {
  TODO = 'todo',
  DOING = 'doing',
  PAUSED = 'paused',
  COMPLETED = 'completed',
}
export interface Task {
  id: any;
  content: string;
  status: TaskStatus;
  dueDate: string;
  assignedTo: string;
}

export type NewTask = Omit<Task, 'id'>;
