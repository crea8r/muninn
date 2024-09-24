import {
  fetchObjectDetails,
  updateObject,
  fetchObjects,
  addObjectTypeValue,
  removeObjectTypeValue,
  updateObjectTypeValue,
  addOrMoveObjectInFunnel,
  deleteObjectFromFunnel,
  forceDeleteObjectStep,
  addTagToObject,
  removeTagFromObject,
  updateObjectStepSubStatus,
} from './object';
import {
  createTask,
  updateTask,
  deleteTask,
  listTasks,
  getTaskById,
} from './task';
import { addFact } from './fact';

export const importCSV = async (csvData: any, selectedObjectTypes: any) => {};

export {
  fetchObjects,
  fetchObjectDetails,
  updateObject,
  addObjectTypeValue,
  addOrMoveObjectInFunnel,
  deleteObjectFromFunnel,
  forceDeleteObjectStep,
  updateObjectStepSubStatus,
  addFact,
  removeObjectTypeValue,
  updateObjectTypeValue,
  addTagToObject,
  removeTagFromObject,
  // task
  createTask,
  updateTask,
  deleteTask,
  listTasks,
  getTaskById,
};
