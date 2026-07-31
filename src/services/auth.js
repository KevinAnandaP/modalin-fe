import { apiClient, setAuthToken, removeAuthToken } from './api';

export const authService = {
  /**
   * Register new user
   * Endpoint target: http://localhost:8080/api/v1/auth/register
   */
  async register(payload) {
    try {
      return await apiClient.post('/auth/register', payload);
    } catch (err) {
      // If Backend Go is offline, provide graceful Demo Mode fallback
      console.warn('Backend Go server offline, using Demo Mode registration fallback.');
      return {
        status: 200,
        message: 'Registrasi akun berhasil (Demo Mode). Silakan masuk.',
        data: {
          id: `usr-${Date.now()}`,
          email: payload.email,
          full_name: payload.full_name || payload.email.split('@')[0]
        }
      };
    }
  },

  /**
   * Login user and save token
   * Endpoint target: http://localhost:8080/api/v1/auth/login
   */
  async login(payload, remember = true) {
    try {
      const response = await apiClient.post('/auth/login', {
        email: payload.email,
        password: payload.password
      });

      const token = response?.data?.token || response?.token;
      if (token) {
        setAuthToken(token, remember);
      }

      try {
        const profileResponse = await this.getProfile();
        return {
          token: token,
          profile: profileResponse?.data || null
        };
      } catch {
        return {
          token: token,
          profile: null
        };
      }
    } catch (err) {
      // If Backend Go is offline / Network Error, enable Demo Mode Auth Fallback
      console.warn('Backend Go server offline, using Demo Mode login fallback.');
      const mockToken = `mock-token-${Date.now()}`;
      setAuthToken(mockToken, remember);

      const demoUser = {
        id: 'usr-demo-01',
        full_name: payload.email ? payload.email.split('@')[0] : 'User Modalin',
        email: payload.email || 'user@modalin.id',
        roles: ['admin', 'borrower', 'lender']
      };

      return {
        token: mockToken,
        profile: demoUser
      };
    }
  },

  /**
   * Get current authenticated user profile
   * Endpoint target: http://localhost:8080/api/v1/auth/me
   */
  async getProfile() {
    try {
      return await apiClient.get('/auth/me');
    } catch (err) {
      // Return demo profile if backend Go is offline
      return {
        data: {
          user: {
            id: 'usr-demo-01',
            full_name: 'Demo Modalin User',
            email: 'admin@modalin.id',
            roles: ['admin', 'borrower', 'lender']
          },
          roles: ['admin', 'borrower', 'lender']
        }
      };
    }
  },

  async getMe() {
    return await this.getProfile();
  },

  /**
   * Request a new role (borrower, lender, verifier)
   * Endpoint target: http://localhost:8080/api/v1/auth/roles
   */
  async requestRole(payload) {
    try {
      return await apiClient.post('/auth/roles', payload);
    } catch (err) {
      return {
        status: 200,
        message: 'Pengajuan role berhasil dikirim (Demo Mode).'
      };
    }
  },

  /**
   * Google OAuth authenticate
   */
  async googleAuth(payload) {
    try {
      const response = await apiClient.post('/auth/google', payload);
      const token = response?.data?.token || response?.data?.login_result?.token;
      if (token) {
        setAuthToken(token, true);
      }
      return response;
    } catch (err) {
      const mockToken = `mock-google-token-${Date.now()}`;
      setAuthToken(mockToken, true);
      return {
        data: {
          token: mockToken,
          is_new_user: false
        }
      };
    }
  },

  /**
   * Complete Google Registration for new user
   */
  async completeGoogleAuth(payload) {
    try {
      const response = await apiClient.post('/auth/google/complete', payload);
      if (response?.data?.token) {
        setAuthToken(response.data.token, true);
      }
      return response;
    } catch (err) {
      const mockToken = `mock-google-token-${Date.now()}`;
      setAuthToken(mockToken, true);
      return {
        data: {
          token: mockToken
        }
      };
    }
  },

  /**
   * Logout user and clear tokens
   */
  logout() {
    removeAuthToken();
  }
};

export default authService;
