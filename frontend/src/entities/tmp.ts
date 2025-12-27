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
