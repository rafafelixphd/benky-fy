import { API_BASE_URL } from "./api-utils";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AnswerCheckResponse {
  correct: boolean;
  feedback?: string;
}

export interface ValidationRequest {
  character: string;
  input: string;
  stroke_data?: {
    strokes: number[][][];
    timing: number[];
  };
}

export interface ValidationResponse {
  is_correct: boolean;
  feedback: string[];
  normalized_input?: string;
  correct_strokes?: number[][][];
}

export interface FlashcardItem {
  id: string; // V2 uses UUID strings
  kanji?: string;
  hiragana?: string;
  katakana?: string;
  english: string | string[]; // Backend returns array, frontend converts to string
  type: string;
  // For display purposes
  question?: string;
  answer?: string;
  furigana?: string;
  romaji?: string;
}

export interface ConjugationItem {
  form: string; // e.g., "polite", "negative", "past"
  kanji: string;
  hiragana: string;
  english: string;
}

export interface ConjugationForm {
  form: string;
  kanji: string;
  hiragana: string;
}

export interface ConjugationResponse {
  word_id: string;
  base_form: {
    kanji: string;
    hiragana: string;
    english: string;
    type: string;
  };
  conjugations: ConjugationForm[];
}

export interface UserSettings {
  flashcard_type: string;
  display_mode: string;
  kana_type: string;
  input_hiragana: boolean;
  input_romaji: boolean;
  input_katakana: boolean;
  input_kanji: boolean;
  input_english: boolean;
  furigana_style: string;
  conjugation_forms: string[];
  practice_mode: string;
  priority_filter: string;
  learning_order: boolean;
  proportions: {
    kana: number;
    kanji: number;
    kanji_furigana: number;
    english: number;
  };
  romaji_enabled: boolean;
  romaji_output_type: string;
  max_answer_attempts: number;
  // Additional frontend-specific properties
  furiganaEnabled?: boolean;
  romajiEnabled?: boolean;
  darkMode?: boolean;
  allowedInputModes?: Record<string, boolean>;
  romajiConversionEnabled?: boolean;
  autoAdvance?: boolean;
  soundEnabled?: boolean;
  difficulty?: string;
  feedbackDisplayMode?: string;
  floatingPosition?: string;
  autoHideDelay?: number;
  showDetailedFeedback?: boolean;
  // Conjugation-specific settings
  conjugation_input_style?: string;
  conjugation_hints?: string;
}

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

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || API_BASE_URL || "";
    if (!this.baseUrl) {
      throw new Error("API_BASE_URL environment variable is not set");
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
        credentials: "include", // Include cookies for session management
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
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
    return this.request<AuthResponse>("/v2/auth/check-auth");
  }

  async login(): Promise<void> {
    window.location.href = `${this.baseUrl}/auth/login`;
  }

  async logout(): Promise<void> {
    window.location.href = `${this.baseUrl}/auth/logout`;
  }

  // V2 Words endpoints
  async getWordsData(
    moduleName: string,
  ): Promise<ApiResponse<FlashcardItem[]>> {
    try {
      const url = `${this.baseUrl}/v2/words/${moduleName}`;
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // V2 API returns { words: [...] } directly
      if (data.words && Array.isArray(data.words)) {
        return {
          success: true,
          data: data.words,
        };
      }

      throw new Error("Invalid response format");
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // V2 Random Words endpoint
  async getRandomWord(moduleName: string): Promise<ApiResponse<FlashcardItem>> {
    try {
      const url = `${this.baseUrl}/v2/words/${moduleName}/random`;
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // V2 API returns the word object directly, not wrapped in { word: {...} }
      if (data.id && data.english !== undefined) {
        // Transform english array to string for frontend compatibility
        const transformedWord = {
          ...data,
          english: Array.isArray(data.english)
            ? data.english.join(" / ")
            : data.english,
        };

        return {
          success: true,
          data: transformedWord,
        };
      }

      throw new Error("Invalid response format");
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // V2 Conjugation endpoints
  async getConjugationData(
    wordId: string,
  ): Promise<ApiResponse<ConjugationResponse>> {
    return this.request<ConjugationResponse>(`/v2/conjugation/${wordId}`);
  }

  // Note: V2 API provides conjugation forms only - frontend handles practice and validation

  // Help endpoints
  async getWordInfo(word: string): Promise<ApiResponse<unknown>> {
    return this.request(`/v2/help/word-info?word=${encodeURIComponent(word)}`);
  }

  // V2 Validation endpoints
  async validateInput(
    request: ValidationRequest,
  ): Promise<ApiResponse<ValidationResponse>> {
    return this.request<ValidationResponse>("/v2/validation/input", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async validateStrokeOrder(
    request: ValidationRequest,
  ): Promise<ApiResponse<ValidationResponse>> {
    return this.request<ValidationResponse>("/v2/validation/stroke-order", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // V2 Feedback endpoint
  async submitFeedback(feedbackData: {
    moduleName: string;
    itemId: string;
    userAnswer: string;
    isCorrect: boolean;
    matchedType?: string;
    attempts: number;
    timestamp: string;
    settings: {
      input_hiragana: boolean;
      input_katakana: boolean;
      input_english: boolean;
      input_kanji: boolean;
      input_romaji: boolean;
      display_mode: string;
      furigana_style: string;
    };
  }): Promise<ApiResponse<unknown>> {
    return this.request("/v2/feedback/answer", {
      method: "POST",
      body: JSON.stringify(feedbackData),
    });
  }

  // Settings endpoints
  async getSettings(moduleName: string): Promise<ApiResponse<UserSettings>> {
    try {
      const url = `${this.baseUrl}/v2/settings/${moduleName}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Transform V2 API format to frontend format
      const transformedSettings = this.transformV2SettingsToFrontend(
        data.settings,
      );

      return {
        success: true,
        data: transformedSettings,
      };
    } catch (error) {
      console.error("Settings GET failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async updateSettings(
    moduleName: string,
    settings: Partial<UserSettings>,
  ): Promise<ApiResponse<UserSettings>> {
    try {
      const url = `${this.baseUrl}/v2/settings/${moduleName}`;

      // Transform frontend format to V2 API format
      const transformedSettings = this.transformFrontendSettingsToV2(settings);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(transformedSettings),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Transform V2 API format back to frontend format
      const transformedResponse = this.transformV2SettingsToFrontend(
        data.settings,
      );

      return {
        success: true,
        data: transformedResponse,
      };
    } catch (error) {
      console.error("Settings POST failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Transformation methods
  private transformV2SettingsToFrontend(v2Settings: any): UserSettings {
    const inputModes = v2Settings.input_modes || [];

    return {
      ...v2Settings,
      // Convert input_modes array to allowedInputModes object
      allowedInputModes: {
        hiragana: inputModes.includes("hiragana"),
        katakana: inputModes.includes("katakana"),
        english: inputModes.includes("english"),
        kanji: inputModes.includes("kanji"),
        romaji: inputModes.includes("romaji"),
      },
      // Map other V2 properties to frontend properties
      furiganaEnabled: v2Settings.furigana_enabled || false,
      romajiEnabled: v2Settings.romaji_enabled || false,
      romajiConversionEnabled: v2Settings.romaji_enabled || false,
      romajiOutputType: v2Settings.romaji_output_type || "hiragana",
      maxAnswerAttempts: v2Settings.max_answer_attempts || 3,
    };
  }

  private transformFrontendSettingsToV2(
    frontendSettings: Partial<UserSettings>,
  ): any {
    const transformed: any = {
      ...frontendSettings,
    };

    // Convert allowedInputModes object to individual input_* boolean properties
    if (frontendSettings.allowedInputModes) {
      transformed.input_hiragana =
        frontendSettings.allowedInputModes.hiragana || false;
      transformed.input_katakana =
        frontendSettings.allowedInputModes.katakana || false;
      transformed.input_english =
        frontendSettings.allowedInputModes.english || false;
      transformed.input_kanji =
        frontendSettings.allowedInputModes.kanji || false;
      transformed.input_romaji =
        frontendSettings.allowedInputModes.romaji || false;
    }

    // Convert frontend properties to V2 API properties
    transformed.furigana_enabled = frontendSettings.furiganaEnabled || false;
    transformed.romaji_enabled =
      frontendSettings.romajiEnabled ||
      frontendSettings.romajiConversionEnabled ||
      false;
    transformed.romaji_output_type =
      frontendSettings.romaji_output_type || "hiragana";
    transformed.max_answer_attempts = frontendSettings.max_answer_attempts || 3;

    // Remove frontend-specific properties that don't exist in V2 API
    delete transformed.allowedInputModes;
    delete transformed.furiganaEnabled;
    delete transformed.romajiEnabled;
    delete transformed.romajiConversionEnabled;
    delete transformed.romajiOutputType;
    delete transformed.maxAnswerAttempts;
    delete transformed.darkMode;
    delete transformed.autoAdvance;
    delete transformed.soundEnabled;
    delete transformed.difficulty;

    return transformed;
  }
}

export const apiClient = new ApiClient();
