import { Fact } from 'src/types';
import { axiosWithAuth } from './utils';

const API_URL = process.env.REACT_APP_API_URL;

export interface FactToCreate {
  text: string;
  happenedAt: string;
  location: string;
  objectIds: string[];
}

export const createFact = async (factToCreate: FactToCreate) => {
  const response = await axiosWithAuth().post(`${API_URL}/facts`, factToCreate);
  return response.data;
};

export interface FactToUpdate {
  id: string;
  text: string;
  happenedAt: string;
  location: string;
  toAddObjectIDs: string[];
  toRemoveObjectIDs: string[];
}

export const updateFact = async (factToUpdate: FactToUpdate) => {
  const response = await axiosWithAuth().put(
    `${API_URL}/facts/${factToUpdate.id}`,
    factToUpdate
  );
  return response.data;
};

export const listFact = async (
  page: number,
  pageSize: number,
  search?: string
) => {
  const response = await axiosWithAuth().get(`${API_URL}/facts`, {
    params: { page, pageSize, search },
  });
  return response.data;
};
