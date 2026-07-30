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
   * Endpoint: DELETE /api/v1/businesses/me
   */
  async deactivateBusiness() {
    return await apiClient.delete('/businesses/me');
  },

  /**
   * Create financial record
   * Endpoint: POST /api/v1/businesses/financial-records
   * @param {Object} payload
   */
  async createFinancialRecord(payload) {
    return await apiClient.post('/businesses/financial-records', payload);
  },

  /**
   * Get list of financial records
   * Endpoint: GET /api/v1/businesses/financial-records
   * @param {Object} params { month, year, type }
   */
  async getFinancialRecords(params = {}) {
    return await apiClient.get('/businesses/financial-records', { params });
  },

  /**
   * Get financial summary for specific month & year
   * Endpoint: GET /api/v1/businesses/financial-records/summary
   * @param {Object} params { month, year }
   */
  async getFinancialSummary(params = {}) {
    return await apiClient.get('/businesses/financial-records/summary', { params });
  },

  /**
   * Delete financial record
   * Endpoint: DELETE /api/v1/businesses/financial-records/:id
   * @param {string} id
   */
  async deleteFinancialRecord(id) {
    return await apiClient.delete(`/businesses/financial-records/${id}`);
  },

  /**
   * Upload financial record proof
   * Endpoint: POST /api/v1/businesses/financial-records/:id/proofs
   * @param {string} id
   * @param {FormData} formData
   */
  async uploadFinancialRecordProof(id, formData) {
    return await apiClient.post(`/businesses/financial-records/${id}/proofs`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * Submit community vote for a business
   * Endpoint: POST /api/v1/businesses/:id/community-vote
   * @param {string} businessId
   * @param {Object} payload { vote_type, comment }
   */
  async voteCommunity(businessId, payload) {
    return await apiClient.post(`/businesses/${businessId}/community-vote`, payload);
  }
};

export default businessService;


