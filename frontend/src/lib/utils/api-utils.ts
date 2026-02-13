export function getBaseUrl() {
  if (typeof window === 'undefined') {
    if (process.env.NODE_ENV === 'production') {
      // return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://benkyfy.site';
      return 'http://benkyfy.site';
    }
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://benkyfy.site';
  }
  return '';
}

export function getBackendUrl() {
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://benkyfy.site';
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://benkyfy.site';
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