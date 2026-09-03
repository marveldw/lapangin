const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'ngrok-skip-browser-warning': 'true',
};

export const api = {
  // GET request
  get: async (endpoint: string, token?: string | null) => {
    const res = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'GET',
      headers: {
        ...defaultHeaders,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return res.json();
  },

  // POST request
  post: async (endpoint: string, body: object, token?: string | null) => {
    const res = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    return res.json();
  },

  // PUT request
  put: async (endpoint: string, body: object, token?: string | null) => {
    const res = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'PUT',
      headers: {
        ...defaultHeaders,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    return res.json();
  },

  // DELETE request
  delete: async (endpoint: string, token?: string | null) => {
    const res = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'DELETE',
      headers: {
        ...defaultHeaders,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return res.json();
  },
};