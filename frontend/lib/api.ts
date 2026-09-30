const getRawUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  if (typeof window !== 'undefined') {
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl.replace(/\/+$/, '');
    }
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:8088`;
  }

  return (envUrl || 'http://localhost:8088').replace(/\/+$/, '');
};

const buildUrl = (endpoint: string) => {
  const rawUrl = getRawUrl();
  const BASE_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;
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

// Ambil token HANYA untuk endpoint yang bukan public auth
const getAuthToken = (endpoint: string, explicitToken?: string | null) => {
  if (explicitToken) return explicitToken;

  // Jangan sertakan token untuk rute autentikasi publik
  const publicEndpoints = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicAuth = publicEndpoints.some((path) => endpoint.includes(path));

  if (isPublicAuth) return null;

  if (typeof window !== 'undefined') {
    return (
      localStorage.getItem('lapangin_token') ||
      localStorage.getItem('token') ||
      null
    );
  }
  return null;
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
  get: async (endpoint: string, token?: string | null) => {
    const activeToken = getAuthToken(endpoint, token);
    const res = await fetch(buildUrl(endpoint), {
      method: 'GET',
      headers: {
        ...defaultHeaders,
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return parseResponse(res);
  },

  post: async (endpoint: string, body: object, token?: string | null) => {
    const activeToken = getAuthToken(endpoint, token);
    const res = await fetch(buildUrl(endpoint), {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
      body: JSON.stringify(body),
    });
    return parseResponse(res);
  },

  put: async (endpoint: string, body: object, token?: string | null) => {
    const activeToken = getAuthToken(endpoint, token);
    const res = await fetch(buildUrl(endpoint), {
      method: 'PUT',
      headers: {
        ...defaultHeaders,
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
      body: JSON.stringify(body),
    });
    return parseResponse(res);
  },

  delete: async (endpoint: string, token?: string | null) => {
    const activeToken = getAuthToken(endpoint, token);
    const res = await fetch(buildUrl(endpoint), {
      method: 'DELETE',
      headers: {
        ...defaultHeaders,
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
    });
    return parseResponse(res);
  },
};
