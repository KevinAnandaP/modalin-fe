import { apiClient } from './api';

export const auditService = {
  /**
   * Get system security & activity audit logs (Admin)
   * Endpoint: GET /api/v1/admin/audit-logs
   * @param {Object} params { action, entity_type, search, start_date, end_date, page, limit }
   */
  async getAuditLogs(params = {}) {
    return await apiClient.get('/admin/audit-logs', params);
  }
};

export default auditService;
