// settings.js
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