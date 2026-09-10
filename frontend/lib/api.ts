const rawUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
const BASE_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

const buildUrl = (endpoint: string) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (cleanEndpoint.startsWith('/api/')) {
    return `${rawUrl.replace(/\/api$/, '')}${cleanEndpoint}`;
  }
  return `${BASE_URL}${cleanEndpoint}`;
};

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'ngrok-skip-browser-warning': 'true',
};

const parseResponse = async (res: Response) => {
  try {
    return await res.json();
  } catch {
    return {
      success: false,
      message: `Terjadi kesalahan pada server (${res.status}).`,
    };
  }
};

export const api = {
  // GET request
  get: async (endpoint: string, token?: string | null) => {
    const res = await fetch(buildUrl(endpoint), {
      method: 'GET',
      headers: {
        ...defaultHeaders,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return parseResponse(res);
  },

  // POST request
  post: async (endpoint: string, body: object, token?: string | null) => {
    const res = await fetch(buildUrl(endpoint), {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    return parseResponse(res);
  },

  // PUT request
  put: async (endpoint: string, body: object, token?: string | null) => {
    const res = await fetch(buildUrl(endpoint), {
      method: 'PUT',
      headers: {
        ...defaultHeaders,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    return parseResponse(res);
  },

  // DELETE request
  delete: async (endpoint: string, token?: string | null) => {
    const res = await fetch(buildUrl(endpoint), {
      method: 'DELETE',
      headers: {
        ...defaultHeaders,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return parseResponse(res);
  },
};