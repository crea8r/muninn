import { axiosWithAuth } from './utils';
import { List, CreatorList } from 'src/types';

const API_URL = process.env.REACT_APP_API_URL;
export interface CreateListParams {
  name: string;
  description: string;
  filterSetting: object;
}
export interface CreateListResponse {
  listId: string;
  creatorListId: string;
  listName: string;
  filterSetting: object;
}

export const createList = async (
  list: CreateListParams
): Promise<CreateListResponse> => {
  const response = await axiosWithAuth().post(`${API_URL}/lists`, list);
  return response.data;
};

export const deleteList = async (id: string): Promise<void> => {
  await axiosWithAuth().delete(`${API_URL}/lists/${id}`);
};

export const updateCreatorList = async (
  listId: string,
  params: any
): Promise<CreatorList> => {
  const response = await axiosWithAuth().put(
    `${API_URL}/lists/${listId}/creator`,
    { params }
  );
  return response.data;
};

export const deleteCreatorList = async (listId: string): Promise<void> => {
  return await axiosWithAuth().delete(`${API_URL}/lists/creator/${listId}`);
};

export const listListsByOrgID = async (
  page: number,
  pageSize: number
): Promise<{
  lists: List[];
  totalCount: number;
  page: number;
  pageSize: number;
}> => {
  const response = await axiosWithAuth().get(`${API_URL}/lists`, {
    params: { page, pageSize },
  });
  return response.data;
};

export const listCreatorListsByCreatorID = async (): Promise<CreatorList[]> => {
  const response = await axiosWithAuth().get(`${API_URL}/lists/creator/`);
  return response.data;
};

export const getCreatorList = async (id: string): Promise<CreatorList> => {
  const response = await axiosWithAuth().get(
    `${API_URL}/lists/creator/detail/${id}`
  );
  return response.data;
};

export const createCreatorList = async (
  listId: string
): Promise<CreatorList> => {
  const response = await axiosWithAuth().post(
    `${API_URL}/lists/${listId}/creator`,
    {}
  );
  return response.data;
};
