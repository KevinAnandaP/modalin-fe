import axios from 'axios';
import { ref } from 'vue';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const TOKEN_KEY = 'token';

const getInitialToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
};

export const authToken = ref(getInitialToken());

export const getAuthToken = () => {
  return authToken.value;
};

export const setAuthToken = (token, remember = true) => {
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
  authToken.value = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  authToken.value = null;
  delete api.defaults.headers.common['Authorization'];
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000
});

// Request Interceptor (injects token)
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * - Formats success response payload
 * - Normalizes backend error messages & HTTP status codes
 * - Handles 401 Unauthorized globally (clears token & dispatches unauthorized event)
 */
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const responseData = error.response?.data;

    // Extract backend error message or fallback to default
    const message =
      responseData?.error ||
      responseData?.message ||
      error.message ||
      'Terjadi kesalahan pada server/jaringan.';

    // Handle 401 Unauthorized globally
    if (status === 401) {
      removeAuthToken();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('modalin:unauthorized', { detail: { message } }));
      }
    }

    const formattedError = {
      status: status || 500,
      message,
      data: responseData || null,
      originalError: error
    };

    return Promise.reject(formattedError);
  }
);

// Helper Axios Interface Object (HTTP Client Wrapper)
export const apiClient = {
  /**
   * Perform GET request
   * @param {string} url 
   * @param {object} [params] 
   * @param {import('axios').AxiosRequestConfig} [config] 
   */
  get: (url, params = {}, config = {}) => {
    return api.get(url, { ...config, params });
  },

  /**
   * Perform POST request
   * @param {string} url 
   * @param {object} [data] 
   * @param {import('axios').AxiosRequestConfig} [config] 
   */
  post: (url, data = {}, config = {}) => {
    return api.post(url, data, config);
  },

  /**
   * Perform PUT request
   * @param {string} url 
   * @param {object} [data] 
   * @param {import('axios').AxiosRequestConfig} [config] 
   */
  put: (url, data = {}, config = {}) => {
    return api.put(url, data, config);
  },

  /**
   * Perform PATCH request
   * @param {string} url 
   * @param {object} [data] 
   * @param {import('axios').AxiosRequestConfig} [config] 
   */
  patch: (url, data = {}, config = {}) => {
    return api.patch(url, data, config);
  },

  /**
   * Perform DELETE request
   * @param {string} url 
   * @param {import('axios').AxiosRequestConfig} [config] 
   */
  delete: (url, config = {}) => {
    return api.delete(url, config);
  },

  /**
   * Perform Multipart / Form Data Upload request
   * @param {string} url 
   * @param {FormData} formData 
   * @param {import('axios').AxiosRequestConfig} [config] 
   */
  upload: (url, formData, config = {}) => {
    return api.post(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * Helper Payment Xendit
   */
  pledgeFunding: (campaignId, amount) => {
    return api.post(`/campaigns/${campaignId}/fundings`, { amount });
  },

  createRepayment: (campaignId, scheduleId, paidAmount) => {
    return api.post(`/campaigns/${campaignId}/repayments`, {
      schedule_id: scheduleId,
      paid_amount: paidAmount
    });
  },

  openPaymentGateway: (invoiceUrl) => {
    if (!invoiceUrl) return false;
    window.open(invoiceUrl, '_blank', 'noopener,noreferrer');
    return true;
  }
};

export const http = apiClient;
export default api;


