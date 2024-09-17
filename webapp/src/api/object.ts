// src/mocks/objectsApi.ts

import { Object, ObjectType, ObjectTypeValue } from '../types/';
import { axiosWithAuth } from './utils';

const API_URL = process.env.REACT_APP_API_URL;

export interface ListObjectResponse {
  objects: Object[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export const fetchObjects = async (
  page: number,
  pageSize: number,
  search?: string
): Promise<ListObjectResponse> => {
  const response = await axiosWithAuth().get(`${API_URL}/setting/objects`, {
    params: { page, pageSize, q: search },
  });
  return response.data;
};

export const fetchObjectTypeValues = async (
  objectId: string
): Promise<ObjectTypeValue[]> => {
  return [];
};
