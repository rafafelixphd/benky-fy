import { getBackendUrl } from "../../../lib/utils/api-utils";
import { ApiResponse } from "@/entities/api/auth";

export interface WordStat {
    id: number;
    surface: string;
    reading: any; // Using any for simplicity as it matches Word structure
    accuracy: number;
    views: number;
}

export interface DashboardStats {
    total_words_known: number;
    mastered_words: number;
    on_the_way_words: number;
    total_attempts: number;
    attempts_positive: number;
    attempts_negative: number;
    top_hardest_words: WordStat[];
    top_viewed_words: WordStat[];
}

class DashboardApiClient {
    private baseUrl: string;

    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl || getBackendUrl() || "";
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
                credentials: "include",
            });

            if (response.status === 401) {
                  // Handle unauthorized logic if needed, e.g. redirect
                  // For now, just return error
                  return { success: false, error: "Session expired" };
            }

            if (!response.ok) {
                 throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
             // Normalize response
            if (data.success === undefined) {
                return { success: true, data: data as T };
            }

            return data;
        } catch (error) {
            console.error("Dashboard API request failed:", error);
             return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async getStats(): Promise<ApiResponse<DashboardStats>> {
        return this.request<DashboardStats>("/v2/dashboard/stats");
    }
}

export const dashboardApiClient = new DashboardApiClient();
