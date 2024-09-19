import { TaskStatus } from '../types/Task';
import {
  fetchObjectDetails,
  updateObject,
  fetchObjects,
  addObjectTypeValue,
  removeObjectTypeValue,
} from './object';

export const addFact = async (newFact: any) => {
  return {
    id: 1,
    text: 'string',
    happened_at: '1-1-24',
    location: 'string',
    object_id: '1',
  };
};

export const fetchTasks = async (objectId: any) => {
  return [];
};

export const addTask = async (objectId: any, newTask: any) => {
  return {
    id: 1,
    content: 'string',
    status: TaskStatus.TODO,
    dueDate: '1-1-24',
    assignedTo: 'hieu',
  };
};

export const updateTaskStatus = async (taskId: any, newStatus: any) => {
  return {
    id: 1,
    content: 'string',
    status: TaskStatus.TODO,
    dueDate: '1-1-24',
    assignedTo: 'hieu',
  };
};

export const reassignTask = async (taskId: any, newAssigneeId: any) => {
  return {
    id: 1,
    content: 'string',
    status: TaskStatus.TODO,
    dueDate: '1-1-24',
    assignedTo: 'hieu',
  };
};

export const updateObjectTypeValue = async (
  objectId: any,
  typeId: any,
  field: any,
  value: any
) => {
  return {
    id: 'updated',
    objectTypeId: 'new',
    values: { key: 'value' },
  };
};

export const fetchObjectFunnels = async (objectId: any) => {
  return [
    {
      objectId: 'obj1',
      funnelId: '1',
      stepId: '2',
    },
    {
      objectId: 'obj2',
      funnelId: '2',
      stepId: '1',
    },
    {
      objectId: 'obj3',
      funnelId: '3',
      stepId: '3',
    },
  ];
};

export const addObjectToFunnel = async (
  objectId: string,
  selectedFunnel: string,
  selectedStep: string
) => {
  return {
    objectId: 'new',
    funnelId: 'new',
    stepId: 'new',
  };
};

export const moveObjectInFunnel = async (
  objectId: any,
  funnelId: any,
  newStepId: any
) => {
  return {
    objectId: 'new',
    funnelId: 'new',
    stepId: 'new',
  };
};

export const removeObjectFromFunnel = async (
  objectId: any,
  funnelId: any
) => {};

export const importCSV = async (csvData: any, selectedObjectTypes: any) => {};

export {
  fetchObjectDetails,
  updateObject,
  fetchObjects,
  addObjectTypeValue,
  removeObjectTypeValue,
};
