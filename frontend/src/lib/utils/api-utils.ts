export function getBaseUrl() {
  if (typeof window === 'undefined') {
    if (process.env.NODE_ENV === 'production') {
      return process.env.NEXT_PUBLIC_API_BASE_URL || '';
    }
    return process.env.NEXT_PUBLIC_API_BASE_URL || `http://benkyfy-frontend:${process.env.PORT || 3000}`;
  }
  return '';
}

export function getBackendUrl() {
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_API_BASE_URL || '';
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://benkyfy-backend:8080';
}

export async function fetchFromBackend(path: string, options: RequestInit = {}) {
  const response = await fetch(`${getBackendUrl()}/${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}