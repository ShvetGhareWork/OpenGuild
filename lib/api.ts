const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper to get the base backend URL (without /api)
export const getBackendUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Client-side: use environment variable or localhost
    return process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  }
  return 'http://localhost:5000';
};

// Helper to get the API URL
export const getApiUrl = (): string => {
  return API_URL;
};

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  displayName: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    userId: string;
    token: string;
    expiresAt: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export const authAPI = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// Token management
export const tokenManager = {
  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  },

  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  },

  setUserId(userId: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_id', userId);
    }
  },

  getUserId(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_id');
    }
    return null;
  },
};
