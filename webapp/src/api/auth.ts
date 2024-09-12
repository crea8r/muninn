import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

interface LoginResponse {
  token: string;
}

export const login = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username,
      password,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'An error occurred during login'
    );
  }
};

export const signup = async (
  orgName: string,
  username: string,
  password: string
): Promise<void> => {
  try {
    await axios.post(`${API_URL}/auth/signup`, {
      org_name: orgName,
      username,
      password,
    });
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'An error occurred during registration'
    );
  }
};
