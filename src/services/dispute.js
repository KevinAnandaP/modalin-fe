import { apiClient } from './api';

export const disputeService = {
  /**
   * Submit a new dispute ticket
   * Endpoint: POST /api/v1/disputes
   * @param {FormData|Object} payload { campaign_id, target_user_id, type, description, proof_file }
   */
  async createDispute(payload) {
    if (payload instanceof FormData) {
      return await apiClient.upload('/disputes', payload);
    }
    return await apiClient.post('/disputes', payload);
  },

  /**
   * Get list of disputes (Admin / User)
   * Endpoint: GET /api/v1/disputes
   * @param {Object} params { status, campaign_id, search }
   */
  async getDisputes(params = {}) {
    return await apiClient.get('/disputes', params);
  },

  /**
   * Get dispute details by ID
   * Endpoint: GET /api/v1/disputes/:id
   * @param {string} id
   */
  async getDisputeById(id) {
    return await apiClient.get(`/disputes/${id}`);
  },

  /**
   * Resolve / Review a dispute (Admin)
   * Endpoint: POST /api/v1/admin/disputes/:id/resolve
   * @param {string} id
   * @param {Object} payload { status, admin_note, decision }
   */
  async resolveDispute(id, payload) {
    return await apiClient.post(`/admin/disputes/${id}/resolve`, payload);
  }
};

export default disputeService;
