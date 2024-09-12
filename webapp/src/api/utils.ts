import axios from 'axios';
import authService from 'src/services/authService';

export const axiosWithAuth = () => {
  const token = authService.getToken();
  return axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};
