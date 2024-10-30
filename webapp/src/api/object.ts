import { Object, NewObject, UpdateObject } from 'src/types/';
import { axiosWithAuth } from './utils';
import { trim } from 'lodash';
import { ListObjectsRow } from 'src/types/Object';

const API_URL = process.env.REACT_APP_API_URL;

export interface ListObjectResponse {
  objects: ListObjectsRow[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export const fetchObjects = async (
  page: number,
  pageSize: number,
  search?: string
): Promise<ListObjectResponse> => {
  let searchQuery = search ? trim(search) : '';
  searchQuery = searchQuery.replaceAll(' ', '&');
  const response = await axiosWithAuth().get(`${API_URL}/objects`, {
    params: { page, pageSize, search: searchQuery },
  });
  return response.data;
};

export const createObject = async (newObject: NewObject): Promise<Object> => {
  const response = await axiosWithAuth().post(`${API_URL}/objects`, newObject);
  return response.data;
};

export const fetchObjectDetails = async (objectId: any) => {
  const response = await axiosWithAuth().get(`${API_URL}/objects/` + objectId);
  return response.data;
};

export const updateObject = async (object: UpdateObject) => {
  const response = await axiosWithAuth().put(
    `${API_URL}/objects/${object.id}`,
    object
  );
  return response.data;
};

export const deleteObject = async (objectId: string) => {
  const response = await axiosWithAuth().delete(
    `${API_URL}/objects/${objectId}`
  );
  return response.data;
};

export const addTagToObject = async (objectId: string, tagId: string) => {
  const response = await axiosWithAuth().post(
    `${API_URL}/objects/${objectId}/tags`,
    { tagId }
  );
  return response.data;
};

export const removeTagFromObject = async (objectId: string, tagId: string) => {
  const response = await axiosWithAuth().delete(
    `${API_URL}/objects/${objectId}/tags/${tagId}`
  );
  return response.data;
};

export const addObjectTypeValue = async (objectId: string, payload: any) => {
  const response = await axiosWithAuth().post(
    `${API_URL}/objects/${objectId}/type-values`,
    payload
  );
  return response.data;
};

export const removeObjectTypeValue = async (
  objectId: string,
  objectTypeValueId: string
) => {
  const response = await axiosWithAuth().delete(
    `${API_URL}/objects/${objectId}/type-values/${objectTypeValueId}`
  );
  return response.data;
};

export const updateObjectTypeValue = async (
  objectId: string,
  objectTypeValueId: string,
  payload: any
) => {
  const response = await axiosWithAuth().put(
    `${API_URL}/objects/${objectId}/type-values/${objectTypeValueId}`,
    payload
  );
  return response.data;
};

export const addOrMoveObjectInFunnel = async (
  objectId: string,
  stepId: string
) => {
  //r.Post("/steps", objStepHandler.Create)
  const response = await axiosWithAuth().post(`${API_URL}/objects/steps`, {
    objId: objectId,
    stepId,
  });
  return response.data;
};

export const deleteObjectFromFunnel = async (objectStepId: string) => {
  //r.Delete("/steps/{id}", objStepHandler.SoftDelete)
  const response = await axiosWithAuth().delete(
    `${API_URL}/objects/steps/${objectStepId}`
  );
  return response.data;
};

/**
 *
 * @param objectStepId
 * @returns void
 * Delete historical value, use to fix a mistake
 */
export const forceDeleteObjectStep = async (objectStepId: string) => {
  const response = await axiosWithAuth().delete(
    `${API_URL}/steps/${objectStepId}/force`
  );
  return response.data;
};

export const updateObjectStepSubStatus = async (
  objectStepId: string,
  subStatus: number
) => {
  const response = await axiosWithAuth().put(
    `${API_URL}/objects/steps/${objectStepId}/sub-status`,
    { subStatus }
  );
  return response.data;
};
