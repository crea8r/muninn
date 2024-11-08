import { axiosWithAuth } from './utils';

const API_URL = process.env.REACT_APP_API_URL;

export const fetchMetrics = async (creatorId: string) => {
  const response = await axiosWithAuth().get(
    `${API_URL}/metrics/creator/${creatorId}`
  );
  return response.data;
};
