"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/private/auth/client";

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