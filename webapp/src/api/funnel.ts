import { axiosWithAuth } from './utils';
import { Funnel, NewFunnel, FunnelUpdate, FunnelStep } from 'src/types/Funnel';

const API_URL = process.env.REACT_APP_API_URL;

export const createFunnel = async (newFunnel: NewFunnel): Promise<Funnel> => {
  const response = await axiosWithAuth().post(
    `${API_URL}/setting/funnels`,
    newFunnel
  );
  return response.data;
};

export const updateFunnel = async (
  funnelUpdate: FunnelUpdate
): Promise<Funnel> => {
  const response = await axiosWithAuth().put(
    `${API_URL}/setting/funnels/${funnelUpdate.id}`,
    funnelUpdate
  );
  return response.data;
};

export const deleteFunnel = async (id: string): Promise<void> => {
  await axiosWithAuth().delete(`${API_URL}/setting/funnels/${id}`);
};

export const fetchAllFunnels = async (
  page: number = 1,
  pageSize: number = 10,
  query: string = ''
): Promise<{
  funnels: Funnel[];
  totalCount: number;
  page: number;
  pageSize: number;
}> => {
  const response = await axiosWithAuth().get(`${API_URL}/setting/funnels`, {
    params: { page, pageSize, q: query },
  });
  return response.data;
};

export const getFunnel = async (id: string): Promise<Funnel> => {
  const response = await axiosWithAuth().get(
    `${API_URL}/setting/funnels/${id}`
  );
  return response.data;
};

export type StepWithObjects = {
  step: any;
  objects: any[];
  totalCount: number;
  currentPage: number;
};

export type FunnelViewType = {
  funnel: any;
  steps: {
    step: FunnelStep;
    objects: any[];
    totalCount: number;
    currentPage: number;
  }[];
};

export const getFunnelView = async (params: {
  id: string;
  query?: any;
}): Promise<FunnelViewType> => {
  // turn query into a string
  const { id, query } = params;
  let queryString;
  if (query) {
    queryString =
      '?' +
      window.Object.keys(query)
        .map((key) => `${key}=${query[key]}`)
        .join('&');
  }
  const response = await axiosWithAuth().get(
    `${API_URL}/setting/funnels/${id}/view${queryString || ''}`
  );
  return response.data;
};
