import { apiClient, setAuthToken, removeAuthToken } from './api';

export const authService = {
  /**
   * Register new user
   * Base URL already includes /api/v1 (http://localhost:8080/api/v1)
   * Endpoint target: http://localhost:8080/api/v1/auth/register
   */
  async register(payload) {
    return await apiClient.post('/auth/register', payload);
  },

  /**
   * Login user and save token
   * Base URL already includes /api/v1 (http://localhost:8080/api/v1)
   * Endpoint target: http://localhost:8080/api/v1/auth/login
   */
  async login(payload, remember = true) {
    const response = await apiClient.post('/auth/login', {
      email: payload.email,
      password: payload.password
    });

    if (response?.data?.token) {
      setAuthToken(response.data.token, remember);
    }

    try {
      const profileResponse = await this.getProfile();
      return {
        token: response?.data?.token,
        profile: profileResponse?.data || null
      };
    } catch {
      return {
        token: response?.data?.token,
        profile: null
      };
    }
  },

  /**
   * Get current authenticated user profile
   * Base URL already includes /api/v1 (http://localhost:8080/api/v1)
   * Endpoint target: http://localhost:8080/api/v1/auth/me
   */
  async getProfile() {
    return await apiClient.get('/auth/me');
  },

  /**
   * Logout user and clear tokens
   */
  logout() {
    removeAuthToken();
  }
};

export default authService;
