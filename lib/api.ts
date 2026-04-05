// Environment-aware backend URL detection
const getRawApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  
  // If we are on Vercel, we can't easily reach localhost:5000
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // In production (Vercel), we should never default to localhost
      // This helps developers notice the missing env var more clearly
      return 'https://openguild-backend.onrender.com/api'; // Fallback to a presumed or example prod URL if unset
    }
  }
  
  return 'http://localhost:5000/api';
};

export const API_URL = getRawApiUrl();

// Helper to get the base backend URL (without /api)
export const getBackendUrl = (): string => {
  return API_URL.replace(/\/api$/, '');
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
// Generic fetch with auth
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<any> {
  const token = tokenManager.getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      tokenManager.removeToken();
      tokenManager.removeUserId();
      // Only redirect if not already on login/signup/forgot-password/landing
      const publicPaths = ['/login', '/signup', '/forgot-password', '/'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login?error=session_expired';
      }
    }
    throw new Error('Unauthorized');
  }

  return response.json();
}

export const userAPI = {
  async getMe() {
    return fetchWithAuth(`${API_URL}/users/me`);
  },
  
  async updateProfile(data: any) {
    return fetchWithAuth(`${API_URL}/users/me`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  
  async syncGitHub() {
    return fetchWithAuth(`${API_URL}/users/me/sync/github`, {
      method: 'POST',
    });
  }
};

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

  removeUserId() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_id');
    }
  },
};
