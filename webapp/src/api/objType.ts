import { axiosWithAuth } from './utils';
import { ObjectType } from 'src/types';

const axios = axiosWithAuth();

const API_URL = process.env.REACT_APP_API_URL;

export interface CreateObjectTypeParams {
  name: string;
  description: string;
  fields: Record<string, any>;
}

export interface UpdateObjectTypeParams {
  name: string;
  description: string;
  fields: Record<string, any>;
}

export interface ListObjectTypesParams {
  page: number;
  pageSize: number;
  query?: string;
}

export interface ListObjectTypesResponse {
  objectTypes: ObjectType[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export const createObjectType = async (
  params: CreateObjectTypeParams
): Promise<ObjectType> => {
  const response = await axios.post(`${API_URL}/setting/object-types`, params);
  return response.data;
};

export const updateObjectType = async (
  id: string,
  params: UpdateObjectTypeParams
): Promise<ObjectType> => {
  const response = await axios.put(
    `${API_URL}/setting/object-types/${id}`,
    params
  );
  return response.data;
};

export const deleteObjectType = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/setting/object-types/${id}`);
};

export const listObjectTypes = async (
  params: ListObjectTypesParams
): Promise<ListObjectTypesResponse> => {
  const response = await axios.get(`${API_URL}/setting/object-types`, {
    params: {
      page: params.page,
      page_size: params.pageSize,
      q: params.query,
    },
  });
  return response.data;
};

export const getObjectType = async (id: string): Promise<ObjectType> => {
  const response = await axios.get(`${API_URL}/setting/object-types/${id}`);
  return response.data;
};