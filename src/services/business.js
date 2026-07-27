import { apiClient } from './api';

export const businessService = {
  /**
   * Create a new business profile
   * Endpoint: POST /api/v1/businesses (Relative to baseURL: /businesses)
   * @param {Object} payload
   */
  async createBusiness(payload) {
    return await apiClient.post('/businesses', payload);
  },

  /**
   * Get authenticated borrower's business profile
   * Endpoint: GET /api/v1/businesses/me (Relative to baseURL: /businesses/me)
   */
  async getMyBusiness() {
    return await apiClient.get('/businesses/me');
  },

  /**
   * Update existing business profile
   * Endpoint: PUT /api/v1/businesses/me (Relative to baseURL: /businesses/me)
   * @param {Object} payload
   */
  async updateBusiness(payload) {
    return await apiClient.put('/businesses/me', payload);
  },

  /**
   * Deactivate business profile
   * Endpoint: DELETE /api/v1/businesses/me (Relative to baseURL: /businesses/me)
   */
  async deactivateBusiness() {
    return await apiClient.delete('/businesses/me');
  }
};

export default businessService;
