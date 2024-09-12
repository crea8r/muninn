import { axiosWithAuth } from './utils';
import { Tag } from '../types/Tag';

const API_URL = process.env.REACT_APP_API_URL;

export interface CreateTagParams {
  name: string;
  description: string;
  color_schema: {
    background: string;
    text: string;
  };
}

export interface UpdateTagParams {
  description: string;
  color_schema: {
    background: string;
    text: string;
  };
}

export interface ListTagsParams {
  page: number;
  pageSize: number;
  query?: string;
}

export interface ListTagsResponse {
  tags: Tag[];
  totalCount: number;
  page: number;
  pageSize: number;
}

const axios = axiosWithAuth();

export const createTag = async (params: CreateTagParams): Promise<Tag> => {
  const response = await axios.post(`${API_URL}/setting/tags`, params, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

export const updateTag = async (
  id: string,
  params: UpdateTagParams
): Promise<Tag> => {
  const response = await axios.put(`${API_URL}/setting/tags/${id}`, params);
  return response.data;
};

export const deleteTag = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/setting/tags/${id}`);
};

export const listTags = async (
  params: ListTagsParams
): Promise<ListTagsResponse> => {
  const response = await axios.get(`${API_URL}/setting/tags`, {
    params: {
      page: params.page,
      page_size: params.pageSize,
      q: params.query,
    },
  });
  return response.data;
};

export const getTag = async (id: string): Promise<Tag> => {
  const response = await axios.get(`${API_URL}/setting/tags/${id}`);
  return response.data;
};
