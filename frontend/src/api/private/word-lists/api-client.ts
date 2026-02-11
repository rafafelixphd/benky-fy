import { API_BASE_URL } from "../../../lib/utils/api-utils";
import { ApiResponse } from "@/entities/api/auth";
import { WordList, WordListEntry, CreateWordListDto, UpdateWordListDto } from "@/entities/word-list";

class WordListsApiClient {
    private baseUrl: string;

    constructor(baseUrl?: string) {
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
                credentials: "include",
            });

            if (response.status === 401) {
                if (typeof window !== "undefined" && !window.location.pathname.includes("/auth/login")) {
                    window.location.href = "/auth/login?error=session_expired";
                    return { success: false, error: "Session expired" };
                }
            }

            if (!response.ok) {
                if (response.status === 404) {
                    return { success: false, error: "not_found" };
                }
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
             // Normalize response if not already ApiResponse shape (backend returns raw object sometimes)
            // But our backend wrapper usually returns { ... }
            // Let's assume standard response for now.
            // Wait, our backend v2 usually returns raw JSON, not wrapped in { success: true, data: ... } 
            // except for some endpoints. The Base Controller might, but let's check.
            // The Flask-RESTx endpoints return `jsonify(payload), status`. 
            // `payload` is usually the object itself or { error: ... }.
            // So we need to wrap it if success.

            if (data.error) {
                return { success: false, error: data.error };
            }
            
            return { success: true, data: data as T };

        } catch (error) {
            console.error("Word Lists API request failed:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async getLists(): Promise<ApiResponse<WordList[]>> {
        return this.request<WordList[]>("/v2/word-lists");
    }

    async createList(data: CreateWordListDto): Promise<ApiResponse<WordList>> {
        return this.request<WordList>("/v2/word-lists", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async getList(id: number): Promise<ApiResponse<WordList>> {
        return this.request<WordList>(`/v2/word-lists/${id}`);
    }

    async updateList(id: number, data: UpdateWordListDto): Promise<ApiResponse<WordList>> {
        return this.request<WordList>(`/v2/word-lists/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    async deleteList(id: number): Promise<ApiResponse<{ message: string }>> {
        return this.request<{ message: string }>(`/v2/word-lists/${id}`, {
            method: "DELETE",
        });
    }

    async addWord(listId: number, wordId: number): Promise<ApiResponse<WordListEntry>> {
        return this.request<WordListEntry>(`/v2/word-lists/${listId}/words`, {
            method: "POST",
            body: JSON.stringify({ word_id: wordId }),
        });
    }

    async removeWord(listId: number, wordId: number): Promise<ApiResponse<{ message: string }>> {
        return this.request<{ message: string }>(`/v2/word-lists/${listId}/words/${wordId}`, {
            method: "DELETE",
        });
    }
}

export const wordListsApiClient = new WordListsApiClient();
