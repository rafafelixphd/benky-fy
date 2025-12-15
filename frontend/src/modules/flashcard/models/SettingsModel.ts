import { UserSettings } from "@/core/api-client";
import { InputType } from "../types/AnswerTypes";

/**
 * SettingsModel - Data model for user settings
 * Implements MVC pattern for settings data management
 */
export class SettingsModel {
  public inputHiragana: boolean;
  public inputKatakana: boolean;
  public inputEnglish: boolean;
  public inputKanji: boolean;
  public inputRomaji: boolean;
  public displayMode: "kanji" | "hiragana" | "katakana" | "english" | "mixed";
  public furiganaStyle: "above" | "below" | "inline" | "none";
  public maxAttempts: number;
  public practiceMode: "flashcard" | "quiz" | "review";
  public priorityFilter: "all" | "difficult" | "recent" | "favorites";
  public learningOrder: boolean;
  public proportions: {
    kana: number;
    kanji: number;
    kanji_furigana: number;
    english: number;
  };
  public romajiEnabled: boolean;
  public romajiOutputType: "hiragana" | "katakana";
  public flashcardType: "standard" | "reverse" | "mixed";
  public kanaType: "hiragana" | "katakana" | "both";
  public furiganaEnabled: boolean;
  public darkMode: boolean;
  public allowedInputModes: Record<string, boolean>;
  public romajiConversionEnabled: boolean;
  public autoAdvance: boolean;
  public soundEnabled: boolean;
  public difficulty: "beginner" | "intermediate" | "advanced";
  public feedbackDisplayMode: "legacy" | "floating" | "both";
  public floatingPosition: "top" | "bottom" | "center" | "modal";
  public autoHideDelay: number;
  public showDetailedFeedback: boolean;

  constructor(data: Partial<UserSettings> = {}) {
    this.inputHiragana = data.input_hiragana ?? true;
    this.inputKatakana = data.input_katakana ?? false;
    this.inputEnglish = data.input_english ?? true;
    this.inputKanji = data.input_kanji ?? false;
    this.inputRomaji = data.input_romaji ?? false;
    this.displayMode =
      (data.display_mode as
        | "kanji"
        | "hiragana"
        | "katakana"
        | "english"
        | "mixed") ?? "kanji";
    this.furiganaStyle =
      (data.furigana_style as "above" | "below" | "inline" | "none") ?? "above";
    this.maxAttempts = data.max_answer_attempts ?? 3;
    this.practiceMode =
      (data.practice_mode as "flashcard" | "quiz" | "review") ?? "flashcard";
    this.priorityFilter =
      (data.priority_filter as "all" | "difficult" | "recent" | "favorites") ??
      "all";
    this.learningOrder = data.learning_order ?? false;
    this.proportions = data.proportions ?? {
      kana: 0.3,
      kanji: 0.3,
      kanji_furigana: 0.2,
      english: 0.2,
    };
    this.romajiEnabled = data.romaji_enabled ?? false;
    this.romajiOutputType =
      (data.romaji_output_type as "hiragana" | "katakana") ?? "hiragana";
    this.flashcardType =
      (data.flashcard_type as "standard" | "reverse" | "mixed") ?? "standard";
    this.kanaType =
      (data.kana_type as "hiragana" | "katakana" | "both") ?? "hiragana";
    this.furiganaEnabled = data.furiganaEnabled ?? false;
    this.darkMode = data.darkMode ?? false;
    this.allowedInputModes = data.allowedInputModes ?? {
      hiragana: true,
      katakana: false,
      english: true,
      kanji: false,
      romaji: false,
    };
    this.romajiConversionEnabled = data.romajiConversionEnabled ?? false;
    this.autoAdvance = data.autoAdvance ?? false;
    this.soundEnabled = data.soundEnabled ?? false;
    this.difficulty =
      (data.difficulty as "beginner" | "intermediate" | "advanced") ??
      "beginner";
    this.feedbackDisplayMode =
      (data.feedbackDisplayMode as "legacy" | "floating" | "both") ?? "legacy";
    this.floatingPosition =
      (data.floatingPosition as "top" | "bottom" | "center" | "modal") ?? "top";
    this.autoHideDelay = data.autoHideDelay ?? 3000;
    this.showDetailedFeedback = data.showDetailedFeedback ?? false;
  }

  /**
   * Convert model to JSON object
   * @returns JSON representation of the model
   */
  toJSON(): UserSettings {
    return {
      input_hiragana: this.inputHiragana,
      input_katakana: this.inputKatakana,
      input_english: this.inputEnglish,
      input_kanji: this.inputKanji,
      input_romaji: this.inputRomaji,
      display_mode: this.displayMode,
      furigana_style: this.furiganaStyle,
      conjugation_forms: [], // Not implemented in this model
      practice_mode: this.practiceMode,
      priority_filter: this.priorityFilter,
      learning_order: this.learningOrder,
      proportions: this.proportions,
      romaji_enabled: this.romajiEnabled,
      romaji_output_type: this.romajiOutputType,
      max_answer_attempts: this.maxAttempts,
      flashcard_type: this.flashcardType,
      kana_type: this.kanaType,
      furiganaEnabled: this.furiganaEnabled,
      romajiEnabled: this.romajiEnabled,
      darkMode: this.darkMode,
      allowedInputModes: this.allowedInputModes,
      romajiConversionEnabled: this.romajiConversionEnabled,
      autoAdvance: this.autoAdvance,
      soundEnabled: this.soundEnabled,
      difficulty: this.difficulty,
      feedbackDisplayMode: this.feedbackDisplayMode,
      floatingPosition: this.floatingPosition,
      autoHideDelay: this.autoHideDelay,
      showDetailedFeedback: this.showDetailedFeedback,
    };
  }

  /**
   * Create model from JSON data
   * @param data JSON data
   * @returns SettingsModel instance
   */
  static fromJSON(data: any): SettingsModel {
    return new SettingsModel(data as UserSettings);
  }

  /**
   * Validate model data
   * @returns Validation result with errors if any
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.maxAttempts < 1 || this.maxAttempts > 10) {
      errors.push("Max attempts must be between 1 and 10");
    }

    if (
      !["kanji", "hiragana", "katakana", "english", "mixed"].includes(
        this.displayMode,
      )
    ) {
      errors.push("Invalid display mode");
    }

    if (!["above", "below", "inline", "none"].includes(this.furiganaStyle)) {
      errors.push("Invalid furigana style");
    }

    if (!["flashcard", "quiz", "review"].includes(this.practiceMode)) {
      errors.push("Invalid practice mode");
    }

    if (
      !["all", "difficult", "recent", "favorites"].includes(this.priorityFilter)
    ) {
      errors.push("Invalid priority filter");
    }

    if (!["hiragana", "katakana"].includes(this.romajiOutputType)) {
      errors.push("Invalid romaji output type");
    }

    if (!["standard", "reverse", "mixed"].includes(this.flashcardType)) {
      errors.push("Invalid flashcard type");
    }

    if (!["hiragana", "katakana", "both"].includes(this.kanaType)) {
      errors.push("Invalid kana type");
    }

    if (!["beginner", "intermediate", "advanced"].includes(this.difficulty)) {
      errors.push("Invalid difficulty level");
    }

    // Validate proportions sum to 1
    const proportionSum = Object.values(this.proportions).reduce(
      (sum, val) => sum + val,
      0,
    );
    if (Math.abs(proportionSum - 1) > 0.01) {
      errors.push("Proportions must sum to 1");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create a deep copy of the model
   * @returns New SettingsModel instance
   */
  clone(): SettingsModel {
    return new SettingsModel({
      input_hiragana: this.inputHiragana,
      input_katakana: this.inputKatakana,
      input_english: this.inputEnglish,
      input_kanji: this.inputKanji,
      input_romaji: this.inputRomaji,
      display_mode: this.displayMode,
      furigana_style: this.furiganaStyle,
      max_answer_attempts: this.maxAttempts,
      practice_mode: this.practiceMode,
      priority_filter: this.priorityFilter,
      learning_order: this.learningOrder,
      proportions: { ...this.proportions },
      romaji_enabled: this.romajiEnabled,
      romaji_output_type: this.romajiOutputType,
      flashcard_type: this.flashcardType,
      kana_type: this.kanaType,
      furiganaEnabled: this.furiganaEnabled,
      darkMode: this.darkMode,
      allowedInputModes: { ...this.allowedInputModes },
      romajiConversionEnabled: this.romajiConversionEnabled,
      autoAdvance: this.autoAdvance,
      soundEnabled: this.soundEnabled,
      difficulty: this.difficulty,
      feedbackDisplayMode: this.feedbackDisplayMode,
      floatingPosition: this.floatingPosition,
      autoHideDelay: this.autoHideDelay,
      showDetailedFeedback: this.showDetailedFeedback,
    });
  }

  /**
   * Get enabled input types
   * @returns Array of enabled input types
   */
  getEnabledInputTypes(): InputType[] {
    const enabledTypes: InputType[] = [];

    if (this.inputHiragana) enabledTypes.push(InputType.HIRAGANA);
    if (this.inputKatakana) enabledTypes.push(InputType.KATAKANA);
    if (this.inputEnglish) enabledTypes.push(InputType.ENGLISH);
    if (this.inputKanji) enabledTypes.push(InputType.KANJI);
    if (this.inputRomaji) enabledTypes.push(InputType.ROMAJI);

    return enabledTypes;
  }

  /**
   * Check if input type is enabled
   * @param inputType Input type to check
   * @returns True if input type is enabled
   */
  isInputTypeEnabled(inputType: InputType): boolean {
    switch (inputType) {
      case InputType.HIRAGANA:
        return this.inputHiragana;
      case InputType.KATAKANA:
        return this.inputKatakana;
      case InputType.ENGLISH:
        return this.inputEnglish;
      case InputType.KANJI:
        return this.inputKanji;
      case InputType.ROMAJI:
        return this.inputRomaji;
      default:
        return false;
    }
  }

  /**
   * Enable input type
   * @param inputType Input type to enable
   */
  enableInputType(inputType: InputType): void {
    switch (inputType) {
      case InputType.HIRAGANA:
        this.inputHiragana = true;
        break;
      case InputType.KATAKANA:
        this.inputKatakana = true;
        break;
      case InputType.ENGLISH:
        this.inputEnglish = true;
        break;
      case InputType.KANJI:
        this.inputKanji = true;
        break;
      case InputType.ROMAJI:
        this.inputRomaji = true;
        break;
    }
  }

  /**
   * Disable input type
   * @param inputType Input type to disable
   */
  disableInputType(inputType: InputType): void {
    switch (inputType) {
      case InputType.HIRAGANA:
        this.inputHiragana = false;
        break;
      case InputType.KATAKANA:
        this.inputKatakana = false;
        break;
      case InputType.ENGLISH:
        this.inputEnglish = false;
        break;
      case InputType.KANJI:
        this.inputKanji = false;
        break;
      case InputType.ROMAJI:
        this.inputRomaji = false;
        break;
    }
  }

  /**
   * Reset to default settings
   */
  resetToDefaults(): void {
    this.inputHiragana = true;
    this.inputKatakana = false;
    this.inputEnglish = true;
    this.inputKanji = false;
    this.inputRomaji = false;
    this.displayMode = "kanji";
    this.furiganaStyle = "above";
    this.maxAttempts = 3;
    this.practiceMode = "flashcard";
    this.priorityFilter = "all";
    this.learningOrder = false;
    this.proportions = {
      kana: 0.3,
      kanji: 0.3,
      kanji_furigana: 0.2,
      english: 0.2,
    };
    this.romajiEnabled = false;
    this.romajiOutputType = "hiragana";
    this.flashcardType = "standard";
    this.kanaType = "hiragana";
    this.furiganaEnabled = false;
    this.darkMode = false;
    this.allowedInputModes = {
      hiragana: true,
      katakana: false,
      english: true,
      kanji: false,
      romaji: false,
    };
    this.romajiConversionEnabled = false;
    this.autoAdvance = false;
    this.soundEnabled = false;
    this.difficulty = "beginner";
    this.feedbackDisplayMode = "legacy";
    this.floatingPosition = "top";
    this.autoHideDelay = 3000;
    this.showDetailedFeedback = false;
  }
}
