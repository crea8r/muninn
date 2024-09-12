import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  role: string;
  org_id: string;
  creator_id: string;
  name: string;
  iat: number;
}

const TOKEN_KEY = 'auth_token';

const authService = {
  login: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated: (): boolean => {
    const token = authService.getToken();
    if (!token) return false;

    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      return decodedToken.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  },

  hasRole: (requiredRole: string): boolean => {
    const token = authService.getToken();
    if (!token) return false;

    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      return requiredRole.includes(decodedToken.role);
    } catch {
      return false;
    }
  },
};

export default authService;
