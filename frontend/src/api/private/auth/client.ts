import { API_BASE_URL } from "@/lib/utils/api-utils";

import {
    ApiResponse,
    AuthResponse,
} from "@/entities/api/auth"

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl?: string) {
        // Empty string is valid - it means use relative URLs (nginx will proxy)
        this.baseUrl = baseUrl || API_BASE_URL || "";
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
    ): Promise<ApiResponse<T>> {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const response = await fetch(url, {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    ...options.headers,
                },
                credentials: "include", // Include cookies for session management
            });

            // Handle Session Expiration / Unauthorized
            if (response.status === 401) {
                // Only redirect if we are not already on the login page to avoid loops
                if (typeof window !== "undefined" && !window.location.pathname.includes("/auth/login")) {
                    window.location.href = "/auth/login?error=session_expired";
                    return {
                        success: false,
                        error: "Session expired. Please log in again.",
                    };
                }
            }

            if (!response.ok) {
                console.log("[api-client] ", response)
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // If response is OK but 'success' is missing, assume success (legacy/backend mismatch adaptation)
            if (response.ok && data.success === undefined) {
                return {
                    success: true,
                    data: data as T
                };
            }

            return data;
        } catch (error) {
            console.error("API request failed:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    // Authentication endpoints
    async checkAuth(): Promise<ApiResponse<AuthResponse>> {
        return this.request<AuthResponse>("/v2/auth/check");
    }

    async login(credentials: { email?: string; password?: string, provider?: string }): Promise<ApiResponse<AuthResponse>> {
        return this.request<AuthResponse>("/v2/auth/login", {
            method: "POST",
            body: JSON.stringify(credentials)
        });
    }

    async register(data: { name: string; email: string; password: string }): Promise<ApiResponse<AuthResponse>> {
        return this.request<AuthResponse>("/v2/auth/register", {
            method: "POST",
            body: JSON.stringify(data)
        });
    }

    async updateUser(data: { name?: string; password?: string; picture?: string }): Promise<ApiResponse<AuthResponse>> {
        return this.request<AuthResponse>("/v2/auth/update", {
            method: "POST",
            body: JSON.stringify(data)
        });
    }

    async logout(): Promise<void> {
        try {
            await this.request("/v2/auth/logout", { method: "POST" });
        } finally {
            window.location.href = "/auth/login?logout=success&clear=true";
        }
    }
}

export const apiClient = new ApiClient();
