import { API_BASE_URL } from "../../../lib/utils/api-utils";
import { Word } from "@/entities/word";
import { ApiResponse } from "@/entities/api/auth"; // Reusing ApiResponse generic
import { FlashcardSettings } from "@/entities/flashcards/settings"; // Correct type

export interface FeedbackData {
    word_id: number;
    display_mode?: string;
    results: Record<string, 'correct' | 'incorrect' | 'gave_up'>;
}

export interface SessionStats {
    total_cards: number;
    correct: number;
    incorrect: number;
    half: number;
    gave_up: number;
}

class WordsApiClient {
    private baseUrl: string;

    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl || API_BASE_URL || "";
        if (!this.baseUrl) {
            console.warn("API_BASE_URL is not set, defaulting to empty string (relative paths)");
        }
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
                console.error(`[words-api] HTTP ${response.status} ${response.statusText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Normalize response
            if (data.success === undefined) {
                return { success: true, data: data as T };
            }

            return data;
        } catch (error) {
            console.error("Words API request failed:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async initSession(settings: FlashcardSettings): Promise<ApiResponse<{ session_id: number; message: string }>> {
        return this.request<{ session_id: number; message: string }>("/v2/words/settings", {
            method: "POST",
            body: JSON.stringify(settings),
        });
    }

    async getRandomWord(): Promise<ApiResponse<Word>> {
        return this.request<Word>("/v2/words/random");
    }

    async getNextWord(): Promise<ApiResponse<Word>> {
        return this.request<Word>("/v2/words/next");
    }

    async submitFeedback(data: FeedbackData): Promise<ApiResponse<{ success: boolean }>> {
        return this.request<{ success: boolean }>("/v2/words/feedback", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async getSessionStats(): Promise<ApiResponse<SessionStats>> {
        return this.request<SessionStats>("/v2/words/session/stats");
    }

    async getWord(id: string): Promise<ApiResponse<Word>> {
        return this.request<Word>(`/v2/words/${id}`);
    }

    async getWordsList(startId?: number, endId?: number, q?: string): Promise<ApiResponse<Word[]>> {
        const params = new URLSearchParams();
        if (startId !== undefined) params.append("start_id", startId.toString());
        if (endId !== undefined) params.append("end_id", endId.toString());
        if (q) params.append("q", q);
        
        return this.request<Word[]>(`/v2/words/list?${params.toString()}`);
    }

    async saveWord(word: Partial<Word>): Promise<ApiResponse<Word>> {
        if (word.id) {
            return this.request<Word>(`/v2/words/${word.id}`, {
                method: "PUT",
                body: JSON.stringify(word),
            });
        }
        return this.request<Word>("/v2/words/edit", {
            method: "POST",
            body: JSON.stringify(word),
        });
    }
}

export const wordsApiClient = new WordsApiClient();
