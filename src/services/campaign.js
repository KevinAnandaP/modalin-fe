import { apiClient } from './api';

export const campaignService = {
  /**
   * Get public campaign catalog with search and filters
   * Endpoint: GET /api/v1/campaigns
   * @param {Object} params { search, category, risk_level, min_amount, max_amount }
   */
  async getCatalog(params = {}) {
    return await apiClient.get('/campaigns', params);
  },

  /**
   * Create a new campaign (Borrower)
   * Endpoint: POST /api/v1/campaigns
   * @param {Object} payload { title, description, category, target_amount, tenor_months, interest_rate }
   */
  async createCampaign(payload) {
    return await apiClient.post('/campaigns', payload);
  },

  /**
   * Get borrower's own campaigns
   * Endpoint: GET /api/v1/campaigns/me
   */
  async getMyCampaigns() {
    return await apiClient.get('/campaigns/me');
  },

  /**
   * Get borrower's campaign by ID
   * Endpoint: GET /api/v1/campaigns/:id
   * @param {string} id
   */
  async getCampaignById(id) {
    return await apiClient.get(`/campaigns/${id}`);
  },

  /**
   * Update borrower's campaign
   * Endpoint: PUT /api/v1/campaigns/:id
   * @param {string} id
   * @param {Object} payload
   */
  async updateCampaign(id, payload) {
    return await apiClient.put(`/campaigns/${id}`, payload);
  },

  /**
   * Delete campaign draft
   * Endpoint: DELETE /api/v1/campaigns/:id
   * @param {string} id
   */
  async deleteCampaign(id) {
    return await apiClient.delete(`/campaigns/${id}`);
  },

  /**
   * Submit campaign for admin review
   * Endpoint: POST /api/v1/campaigns/:id/submit
   * @param {string} id
   */
  async submitCampaign(id) {
    return await apiClient.post(`/campaigns/${id}/submit`);
  },

  // --- Budget Items (RAB) ---

  /**
   * List budget items for a campaign
   * Endpoint: GET /api/v1/campaigns/:id/budget-items
   * @param {string} campaignId
   */
  async getBudgetItems(campaignId) {
    return await apiClient.get(`/campaigns/${campaignId}/budget-items`);
  },

  /**
   * Create budget item (RAB)
   * Endpoint: POST /api/v1/campaigns/:id/budget-items
   * @param {string} campaignId
   * @param {Object} payload { item_name, quantity, unit_price, category }
   */
  async createBudgetItem(campaignId, payload) {
    return await apiClient.post(`/campaigns/${campaignId}/budget-items`, payload);
  },

  /**
   * Update budget item (RAB)
   * Endpoint: PUT /api/v1/campaigns/:id/budget-items/:budgetId
   * @param {string} campaignId
   * @param {string} budgetId
   * @param {Object} payload
   */
  async updateBudgetItem(campaignId, budgetId, payload) {
    return await apiClient.put(`/campaigns/${campaignId}/budget-items/${budgetId}`, payload);
  },

  /**
   * Delete budget item (RAB)
   * Endpoint: DELETE /api/v1/campaigns/:id/budget-items/:budgetId
   * @param {string} campaignId
   * @param {string} budgetId
   */
  async deleteBudgetItem(campaignId, budgetId) {
    return await apiClient.delete(`/campaigns/${campaignId}/budget-items/${budgetId}`);
  },

  // --- Milestones ---

  /**
   * List milestones for a campaign
   * Endpoint: GET /api/v1/campaigns/:id/milestones
   * @param {string} campaignId
   */
  async getMilestones(campaignId) {
    return await apiClient.get(`/campaigns/${campaignId}/milestones`);
  },

  /**
   * Create milestone for a campaign
   * Endpoint: POST /api/v1/campaigns/:id/milestones
   * @param {string} campaignId
   * @param {Object} payload { title, description, target_amount, order_number }
   */
  async createMilestone(campaignId, payload) {
    return await apiClient.post(`/campaigns/${campaignId}/milestones`, payload);
  },

  /**
   * Update milestone
   * Endpoint: PUT /api/v1/campaigns/:id/milestones/:milestoneId
   * @param {string} campaignId
   * @param {string} milestoneId
   * @param {Object} payload
   */
  async updateMilestone(campaignId, milestoneId, payload) {
    return await apiClient.put(`/campaigns/${campaignId}/milestones/${milestoneId}`, payload);
  },

  /**
   * Delete milestone
   * Endpoint: DELETE /api/v1/campaigns/:id/milestones/:milestoneId
   * @param {string} campaignId
   * @param {string} milestoneId
   */
  async deleteMilestone(campaignId, milestoneId) {
    return await apiClient.delete(`/campaigns/${campaignId}/milestones/${milestoneId}`);
  },

  /**
   * Pledge / Danai campaign (Lender)
   * Endpoint: POST /api/v1/campaigns/:id/fundings
   * @param {string} campaignId
   * @param {number} amount
   */
  async pledgeCampaign(campaignId, amount) {
    return await apiClient.post(`/campaigns/${campaignId}/fundings`, { amount: Number(amount) });
  },

  /**
   * Get lender's own fundings
   * Endpoint: GET /api/v1/campaigns/fundings/me
   */
  async getLenderFundings() {
    return await apiClient.get('/campaigns/fundings/me');
  },

  /**
   * List disbursements for a campaign
   * Endpoint: GET /api/v1/campaigns/:id/disbursements
   * @param {string} campaignId
   */
  async getDisbursements(campaignId) {
    return await apiClient.get(`/campaigns/${campaignId}/disbursements`);
  },

  /**
   * Upload fund usage proof (Borrower)
   * Endpoint: POST /api/v1/campaigns/:id/disbursements/:disbursementId/proofs
   * @param {string} campaignId
   * @param {string} disbursementId
   * @param {FormData|Object} payload
   */
  async uploadFundUsageProof(campaignId, disbursementId, payload) {
    if (payload instanceof FormData) {
      return await apiClient.upload(`/campaigns/${campaignId}/disbursements/${disbursementId}/proofs`, payload);
    }
    return await apiClient.post(`/campaigns/${campaignId}/disbursements/${disbursementId}/proofs`, payload);
  },

  /**
   * Create monthly progress report (Borrower)
   * Endpoint: POST /api/v1/campaigns/:id/monthly-reports
   */
  async createMonthlyProgressReport(campaignId, payload) {
    return await apiClient.post(`/campaigns/${campaignId}/monthly-reports`, payload);
  },

  /**
   * List monthly progress reports
   * Endpoint: GET /api/v1/campaigns/:id/monthly-reports
   */
  async getMonthlyProgressReports(campaignId) {
    return await apiClient.get(`/campaigns/${campaignId}/monthly-reports`);
  },

  /**
   * Create revenue report (Borrower)
   * Endpoint: POST /api/v1/campaigns/:id/revenue-reports
   */
  async createRevenueReport(campaignId, payload) {
    return await apiClient.post(`/campaigns/${campaignId}/revenue-reports`, payload);
  },

  /**
   * List revenue reports
   * Endpoint: GET /api/v1/campaigns/:id/revenue-reports
   */
  async getRevenueReports(campaignId) {
    return await apiClient.get(`/campaigns/${campaignId}/revenue-reports`);
  },

  // --- Admin Review & Moderation ---

  /**
   * Review campaign (Admin)
   * Endpoint: POST /api/v1/admin/campaigns/:id/review
   * @param {string} campaignId
   * @param {Object} payload { decision, admin_note }
   */
  async reviewCampaign(campaignId, payload) {
    return await apiClient.post(`/admin/campaigns/${campaignId}/review`, payload);
  },

  /**
   * Get role requests for admin review
   * Endpoint: GET /api/v1/admin/roles/requests
   */
  async getRoleRequests() {
    return await apiClient.get('/admin/roles/requests');
  },

  /**
   * Review role request (Admin)
   * Endpoint: POST /api/v1/admin/roles/review
   * @param {Object} payload { request_id, action, reason }
   */
  async reviewRoleRequest(payload) {
    const body = {
      request_id: payload.request_id || payload.requestId,
      action: payload.action || (payload.decision === 'approved' ? 'approve' : 'reject'),
      reason: payload.reason || payload.admin_note || ''
    };
    return await apiClient.post('/admin/roles/review', body);
  },

  /**
   * Get fund usage proofs for admin review
   * Endpoint: GET /api/v1/admin/fund-usage-proofs
   */
  async getFundUsageProofs() {
    return await apiClient.get('/admin/fund-usage-proofs');
  },

  /**
   * Review fund usage proof (Admin)
   * Endpoint: POST /api/v1/admin/fund-usage-proofs/:proofID/review
   * @param {string} proofID
   * @param {Object} payload { decision, note }
   */
  async reviewFundUsageProof(proofID, payload) {
    return await apiClient.post(`/admin/fund-usage-proofs/${proofID}/review`, payload);
  },

  /**
   * Get lender return distributions
   * Endpoint: GET /api/v1/lender/return-distributions
   */
  async getLenderReturnDistributions() {
    return await apiClient.get('/lender/return-distributions');
  }
};

export default campaignService;


