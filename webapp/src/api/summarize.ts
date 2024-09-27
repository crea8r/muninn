import { axiosWithAuth } from './utils';
import { PersonalSummarize } from 'src/types/Summarize';

const API_URL = process.env.REACT_APP_API_URL;

export const personalSummarize = async (): Promise<PersonalSummarize> => {
  const response = await axiosWithAuth().get(`${API_URL}/summarize/personal`);
  return response.data;
};
