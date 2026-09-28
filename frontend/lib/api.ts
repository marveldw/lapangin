const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname;
    const currentProtocol = window.location.protocol;
    const envUrl = process.env.NEXT_PUBLIC_API_URL;

    // Jika diakses dari HP / IP publik (misal 103.127.132.8) tetapi env berisi localhost
    if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
      if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
        return `${currentProtocol}//${currentHost}:8080/api`;
      }
    }

    if (envUrl) {
      const clean = envUrl.replace(/\/+$/, '');
      return clean.endsWith('/api') ? clean : `${clean}/api`;
    }

    return `${currentProtocol}//${currentHost}:8080/api`;
  }

  const rawUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api').replace(/\/+$/, '');
  return rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;
};

const buildUrl = (endpoint: string) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const baseUrl = getBaseUrl();
  if (cleanEndpoint.startsWith('/api/')) {
    return `${baseUrl.replace(/\/api$/, '')}${cleanEndpoint}`;
  }
  return `${baseUrl}${cleanEndpoint}`;
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