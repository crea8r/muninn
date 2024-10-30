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
  deleteObject,
} from './object';
import {
  createTask,
  updateTask,
  deleteTask,
  listTasks,
  getTaskById,
} from './task';
import { createFact, listFact, updateFact } from './fact';
import {
  listOrgMembers,
  addNewOrgMember,
  updateOrgDetails,
  updateUserPassword,
  updateUserProfile,
  updateUserRoleAndStatus,
} from './orgMember';
import { personalSummarize } from './summarize';

export const importCSV = async (csvData: any, selectedObjectTypes: any) => {};

export {
  fetchObjects,
  fetchObjectDetails,
  updateObject,
  deleteObject,
  addObjectTypeValue,
  addOrMoveObjectInFunnel,
  deleteObjectFromFunnel,
  forceDeleteObjectStep,
  updateObjectStepSubStatus,
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
  // org member
  listOrgMembers,
  addNewOrgMember,
  updateOrgDetails,
  updateUserPassword,
  updateUserProfile,
  updateUserRoleAndStatus,
  // summarize
  personalSummarize,
  // fact
  createFact,
  updateFact,
  listFact,
};
