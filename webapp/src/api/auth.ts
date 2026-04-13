import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

interface LoginResponse {
  token: string;
  creators?: any[];
}

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'An error occurred during login'
    );
  }
};

interface SignUpRequest {
  org_name: string;
  email?: string;
  password?: string;
  wallet_id?: string;
}

export const signup = async (req: SignUpRequest): Promise<void> => {
  const { org_name, email, password, wallet_id } = req;
  if (!org_name || ((!email || !password) && !wallet_id)) {
    throw new Error(
      'Organization name is required, along with email and password or wallet ID'
    );
  }

  try {
    await axios.post(`${API_URL}/auth/signup`, {
      org_name,
      email,
      password,
      wallet_id,
    });
  } catch (error: any) {
    throw new Error(
      error.response?.data || 'An error occurred during registration'
    );
  }
};
