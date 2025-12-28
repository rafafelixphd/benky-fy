"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/private/flashcards/api-client";
import type { UserSettings } from "@/entities/tmp";

// Authentication hooks
export const useAuth = () => {
  const enableBypass = (process.env.NODE_ENV === "development" && process.env.AUTH_BYPASS === "false");

  // Development mode - return synchronous data
  if (enableBypass) {
    return {
      data: {
        authenticated: true,
        user: {
          id: "dev-user",
          name: "Hooks User",
          email: "dev@example.com",
          picture: "/user_icon.svg",
          joinDate: new Date().toISOString().split("T")[0],
          currentLevel: "Beginner",
          totalStudyTime: "0 hours",
          streakDays: 0,
          totalWordsLearned: 0,
          favoriteModules: ["Hiragana", "Basic Words", "Common Phrases"],
          provider: "development",
        },
        session_keys: ["user"],
        google_authorized: true,
      },
      isLoading: false,
      error: null,
    };
  }

  return useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      try {
        const response = await apiClient.checkAuth();
        if (response.success && response.data?.authenticated) {
          return response.data;
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }

      // Return unauthenticated state
      return {
        authenticated: false,
        user: undefined,
        session_keys: [],
        google_authorized: false,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Flashcard hooks
export const useWordsData = (moduleName: string) => {
  return useQuery({
    queryKey: ["words", moduleName],
    queryFn: async () => {
      const response = await apiClient.getWordsData(moduleName);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch words data");
      }
      return response.data;
    },
    enabled: !!moduleName,
  });
};

// Random word selection hook
export const useRandomWord = (moduleName: string) => {
  return useQuery({
    queryKey: ["randomWord", moduleName],
    queryFn: async () => {
      const response = await apiClient.getRandomWord(moduleName);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch random word");
      }
      return response.data;
    },
    enabled: !!moduleName,
    staleTime: 0, // Always fetch fresh random word
    refetchOnWindowFocus: false,
  });
};

// Settings hooks
export const useSettings = (moduleName: string) => {
  return useQuery({
    queryKey: ["settings", moduleName],
    queryFn: async () => {
      const response = await apiClient.getSettings(moduleName);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch settings");
      }
      return response.data;
    },
    enabled: !!moduleName,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

interface UpdateSettingsParams {
  moduleName: string;
  settings: UserSettings;
}

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ moduleName, settings }: UpdateSettingsParams) => {
      const response = await apiClient.updateSettings(moduleName, settings);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to update settings");
      }
      return response.data;
    },
    onSuccess: (data, variables: UpdateSettingsParams) => {
      queryClient.setQueryData(["settings", variables.moduleName], data);
    },
  });
};

// Help hooks
export const useWordInfo = (word: string) => {
  return useQuery({
    queryKey: ["wordInfo", word],
    queryFn: async () => {
      const response = await apiClient.getWordInfo(word);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch word info");
      }
      return response.data;
    },
    enabled: !!word && word.length > 0,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Answer tracking types
export interface AnswerResult {
  moduleName: string;
  itemId: string;
  userAnswer: string;
  isCorrect: boolean;
  matchedType?: string;
  attempts: number;
  timestamp: string;
  timerDuration?: number;
  settings: {
    input_hiragana: boolean;
    input_katakana: boolean;
    input_english: boolean;
    input_kanji: boolean;
    input_romaji: boolean;
    display_mode: string;
    furigana_style: string;
  };
}

// Answer tracking hook
export const useTrackAnswer = () => {
  return useMutation({
    mutationFn: async (result: AnswerResult) => {
      // Send to backend feedback endpoint
      const response = await apiClient.submitFeedback({
        moduleName: result.moduleName,
        itemId: result.itemId,
        userAnswer: result.userAnswer,
        isCorrect: result.isCorrect,
        matchedType: result.matchedType,
        attempts: result.attempts,
        timestamp: result.timestamp,
        settings: {
          input_hiragana: result.settings.input_hiragana || false,
          input_katakana: result.settings.input_katakana || false,
          input_english: result.settings.input_english || false,
          input_kanji: result.settings.input_kanji || false,
          input_romaji: result.settings.input_romaji || false,
          display_mode: result.settings.display_mode || "kanji_furigana",
          furigana_style: result.settings.furigana_style || "ruby",
        },
      });

      return response;
    },
    onError: (error) => {
      console.error("Failed to track answer result:", error);
    },
  });
};

// Validation types
export interface ValidationRequest {
  input: string;
  type: "hiragana" | "katakana" | "kanji" | "english" | "romaji";
  moduleName: string;
  itemId?: string;
  character?: string; // Required for stroke order validation
}

export interface ValidationResponse {
  is_correct: boolean;
  feedback?: string;
  converted_input?: string;
  matched_type?: string;
}

// Input validation hooks
export const useValidateInput = () => {
  return useMutation({
    mutationFn: async (request: ValidationRequest) => {
      const response = await apiClient.validateInput({
        ...request,
        character: request.character || request.input, // Fallback to input if character not provided
      });
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to validate input");
      }
      return response.data;
    },
    onError: (error) => {
      console.error("Input validation failed:", error);
    },
  });
};

export const useValidateStrokeOrder = () => {
  return useMutation({
    mutationFn: async (request: ValidationRequest) => {
      const response = await apiClient.validateStrokeOrder({
        ...request,
        character: request.character || request.input, // Fallback to input if character not provided
      });
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to validate stroke order");
      }
      return response.data;
    },
    onError: (error) => {
      console.error("Stroke order validation failed:", error);
    },
  });
};
