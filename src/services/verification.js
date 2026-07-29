import { apiClient } from './api';

export const verificationService = {
  /**
   * Get assigned verification requests for authenticated verifier
   * Endpoint: GET /api/v1/verifier/verification-requests
   */
  async getVerifierTasks() {
    return await apiClient.get('/verifier/verification-requests');
  },

  /**
   * Submit field verification report (Verifier)
   * Endpoint: POST /api/v1/verifier/verification-requests/:id/report
   * @param {string} requestId
   * @param {Object} payload { is_business_exists, is_business_active, location_match, recommendation, notes, photo_url }
   */
  async submitReport(requestId, payload) {
    return await apiClient.post(`/verifier/verification-requests/${requestId}/report`, payload);
  },

  /**
   * Upload location photo for verification request
   * Endpoint: POST /api/v1/verifier/verification-requests/:id/photo
   * @param {string} requestId
   * @param {FormData} formData
   */
  async uploadPhoto(requestId, formData) {
    return await apiClient.upload(`/verifier/verification-requests/${requestId}/photo`, formData);
  },

  /**
   * Get all verification requests for Admin review & assignment
   * Endpoint: GET /api/v1/admin/verification-requests
   */
  async getAdminRequests() {
    return await apiClient.get('/admin/verification-requests');
  },

  /**
   * Assign verifier to a verification request (Admin)
   * Endpoint: POST /api/v1/admin/verification-requests/:id/assign
   * @param {string} requestId
   * @param {Object} payload { verifier_id }
   */
  async assignVerifier(requestId, payload) {
    return await apiClient.post(`/admin/verification-requests/${requestId}/assign`, payload);
  },

  /**
   * Execute final decision on verification request (Admin)
   * Endpoint: POST /api/v1/admin/verification-requests/:id/decision
   * @param {string} requestId
   * @param {Object} payload { decision, note }
   */
  async decideRequest(requestId, payload) {
    return await apiClient.post(`/admin/verification-requests/${requestId}/decision`, payload);
  },

  /**
   * Verify monthly progress report (Verifier)
   * Endpoint: POST /api/v1/verifier/monthly-reports/:id/review
   */
  async verifyMonthlyReport(reportId, payload) {
    return await apiClient.post(`/verifier/monthly-reports/${reportId}/review`, payload);
  },

  /**
   * Verify revenue report (Verifier)
   * Endpoint: POST /api/v1/verifier/revenue-reports/:id/review
   */
  async verifyRevenueReport(reportId, payload) {
    return await apiClient.post(`/verifier/revenue-reports/${reportId}/review`, payload);
  },

  /**
   * Verify repayment payment (Verifier)
   * Endpoint: POST /api/v1/verifier/repayments/:id/review
   */
  async verifyRepayment(repaymentId, payload) {
    return await apiClient.post(`/verifier/repayments/${repaymentId}/review`, payload);
  }
};

export default verificationService;

