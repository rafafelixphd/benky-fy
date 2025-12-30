// auth.js

export interface AuthUser {
    name: string;
    email: string;
    picture?: string;
}

export interface AuthResponse {
    authenticated: boolean;
    user?: AuthUser;
    session_keys?: string[];
    google_authorized?: boolean;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}