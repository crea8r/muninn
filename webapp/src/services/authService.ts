import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  role: string;
  org_id: string;
  org_name: string;
  creator_id: string;
  name: string;
  iat: number;
  profile: any;
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

  getCreatorId: (): string | null => {
    const token = authService.getToken();
    if (!token) return null;

    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      return decodedToken.creator_id;
    } catch {
      return null;
    }
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

  getDetails: () => {
    const token = authService.getToken();
    if (!token) return undefined;

    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      return {
        creatorId: decodedToken.creator_id,
        orgId: decodedToken.org_id,
        name: decodedToken.name,
        orgName: decodedToken.org_name,
        role: decodedToken.role,
        profile: decodedToken.profile,
      };
    } catch {
      return undefined;
    }
  },
};

export default authService;
