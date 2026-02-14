export function getBaseUrl() {
  if (typeof window === 'undefined') {
    if (process.env.NODE_ENV === 'production') {
      return 'https://benkyfy.site';
    }
    return 'http://localhost:3000';
  }
  return 'http://localhost:3000';
}

export function getServerSideBackendUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    return 'https://benkyfy.site';
  }
  return 'http://backend:8080';
}

export function getGoogleRedirectUri(): string {
  if (process.env.NODE_ENV === 'production') {
    return process.env.GOOGLE_REDIRECT_URI || 'https://benkyfy.site/auth/google/callback';
  }
  return process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';
}


export function getBackendUrl() {
  if (process.env.NODE_ENV === 'production') {
    return 'https://benkyfy.site';
  }
  return 'http://localhost:8080';
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