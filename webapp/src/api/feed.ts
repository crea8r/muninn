import { axiosWithAuth } from './utils';

const API_URL = process.env.REACT_APP_API_URL;

export const getFeed = async (): Promise<any> => {
  const response = await axiosWithAuth().get(`${API_URL}/feeds`);
  return response.data;
};
