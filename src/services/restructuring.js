import { apiClient } from './api';

export const restructuringService = {
  /**
   * Submit a loan repayment restructuring request (Borrower)
   * Endpoint: POST /api/v1/borrower/restructuring-requests
   * @param {FormData|Object} payload { campaign_id, reason, proposed_tenor_months, proof_file }
   */
  async createRestructuringRequest(payload) {
    if (payload instanceof FormData) {
      return await apiClient.upload('/borrower/restructuring-requests', payload);
    }
    return await apiClient.post('/borrower/restructuring-requests', payload);
  },

  /**
   * Get list of restructuring requests (Admin / Borrower)
   * Endpoint: GET /api/v1/restructuring-requests
   * @param {Object} params { status, campaign_id }
   */
  async getRestructuringRequests(params = {}) {
    return await apiClient.get('/restructuring-requests', params);
  },

  /**
   * Review restructuring request (Admin)
   * Endpoint: POST /api/v1/admin/restructuring-requests/:id/review
   * @param {string} id
   * @param {Object} payload { decision, admin_note }
   */
  async reviewRestructuringRequest(id, payload) {
    return await apiClient.post(`/admin/restructuring-requests/${id}/review`, payload);
  }
};

export default restructuringService;
