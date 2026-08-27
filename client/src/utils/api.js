/**
 * Safe API Client Utility
 * Prevents "Unexpected token '<', '<!DOCTYPE...' is not valid JSON" errors
 * by validating response content-types, status codes, and providing structured fallbacks.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export async function safeFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const token = localStorage.getItem('regmate_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const contentType = res.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (!res.ok) {
        const error = new Error(data.message || data.error || `HTTP ${res.status}: Request failed`);
        error.status = res.status;
        error.data = data;
        throw error;
      }
      return data;
    } else {
      // Non-JSON response received (HTML, plain text, proxy gateway error)
      const text = await res.text();
      let errorMsg = `Server returned non-JSON response (${res.status})`;
      if (res.status === 404) {
        errorMsg = `API route not found: ${url}`;
      } else if (res.status === 413) {
        errorMsg = 'Upload payload too large. Please compress or select a smaller image (<10MB).';
      } else if (res.status >= 500) {
        errorMsg = 'Backend server error. Please ensure the server is running.';
      }
      
      const error = new Error(errorMsg);
      error.status = res.status;
      error.rawBody = text.slice(0, 300);
      throw error;
    }
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error(`Network error connecting to ${url}. Please verify your network and backend server status.`);
    }
    throw err;
  }
}

export const api = {
  get: (endpoint, options) => safeFetch(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) => safeFetch(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),
  put: (endpoint, body, options) => safeFetch(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }),
  delete: (endpoint, options) => safeFetch(endpoint, { method: 'DELETE', ...options })
};

export default api;
