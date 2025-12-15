import {
  FlashcardItem,
  FlashcardCreateData,
  FlashcardUpdateData,
  WordType,
} from "../types/FlashcardTypes";

/**
 * FlashcardModel - Data model for flashcard items
 * Implements MVC pattern for flashcard data management
 */
export class FlashcardModel {
  public readonly id: string;
  public kanji?: string;
  public hiragana?: string;
  public katakana?: string;
  public english: string | string[];
  public type: WordType;
  public furigana?: string;
  public romaji?: string;
  public pronunciation?: string;
  public difficulty?: "beginner" | "intermediate" | "advanced";
  public tags?: string[];
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: FlashcardCreateData | FlashcardItem) {
    this.id = "id" in data ? data.id : this.generateId();
    this.kanji = data.kanji;
    this.hiragana = data.hiragana;
    this.katakana = data.katakana;
    this.english = data.english;
    this.type = data.type;
    this.furigana = data.furigana;
    this.romaji = data.romaji;
    this.pronunciation = data.pronunciation;
    this.difficulty = data.difficulty || "beginner";
    this.tags = data.tags || [];
    this.createdAt =
      "createdAt" in data && data.createdAt
        ? new Date(data.createdAt)
        : new Date();
    this.updatedAt =
      "updatedAt" in data && data.updatedAt
        ? new Date(data.updatedAt)
        : new Date();
  }

  /**
   * Convert model to JSON object
   * @returns JSON representation of the model
   */
  toJSON(): FlashcardItem {
    return {
      id: this.id,
      kanji: this.kanji,
      hiragana: this.hiragana,
      katakana: this.katakana,
      english: this.english,
      type: this.type,
      furigana: this.furigana,
      romaji: this.romaji,
      pronunciation: this.pronunciation,
      difficulty: this.difficulty,
      tags: this.tags,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Create model from JSON data
   * @param data JSON data
   * @returns FlashcardModel instance
   */
  static fromJSON(data: any): FlashcardModel {
    return new FlashcardModel(data as FlashcardItem);
  }

  /**
   * Validate model data
   * @returns Validation result with errors if any
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.id || this.id.trim() === "") {
      errors.push("ID is required");
    }

    if (
      !this.english ||
      (typeof this.english === "string" && this.english.trim() === "")
    ) {
      errors.push("English translation is required");
    }

    if (!this.type || !Object.values(WordType).includes(this.type)) {
      errors.push("Valid word type is required");
    }

    if (
      this.difficulty &&
      !["beginner", "intermediate", "advanced"].includes(this.difficulty)
    ) {
      errors.push("Difficulty must be beginner, intermediate, or advanced");
    }

    if (this.tags && !Array.isArray(this.tags)) {
      errors.push("Tags must be an array");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create a deep copy of the model
   * @returns New FlashcardModel instance
   */
  clone(): FlashcardModel {
    return new FlashcardModel({
      id: this.id,
      kanji: this.kanji,
      hiragana: this.hiragana,
      katakana: this.katakana,
      english: Array.isArray(this.english) ? [...this.english] : this.english,
      type: this.type,
      furigana: this.furigana,
      romaji: this.romaji,
      pronunciation: this.pronunciation,
      difficulty: this.difficulty,
      tags: this.tags ? [...this.tags] : undefined,
      createdAt: new Date(this.createdAt),
      updatedAt: new Date(this.updatedAt),
    });
  }

  /**
   * Update model with new data
   * @param data Update data
   */
  update(data: FlashcardUpdateData): void {
    if (data.kanji !== undefined) this.kanji = data.kanji;
    if (data.hiragana !== undefined) this.hiragana = data.hiragana;
    if (data.katakana !== undefined) this.katakana = data.katakana;
    if (data.english !== undefined) this.english = data.english;
    if (data.type !== undefined) this.type = data.type;
    if (data.furigana !== undefined) this.furigana = data.furigana;
    if (data.romaji !== undefined) this.romaji = data.romaji;
    if (data.pronunciation !== undefined)
      this.pronunciation = data.pronunciation;
    if (data.difficulty !== undefined) this.difficulty = data.difficulty;
    if (data.tags !== undefined) this.tags = data.tags;

    this.updatedAt = new Date();
  }

  /**
   * Get display text for a specific field
   * @param field Field name
   * @returns Display text
   */
  getDisplayText(field: string): string {
    switch (field) {
      case "kanji":
        return this.kanji || "";
      case "hiragana":
        return this.hiragana || "";
      case "katakana":
        return this.katakana || "";
      case "english":
        return Array.isArray(this.english)
          ? this.english.join(" / ")
          : this.english;
      case "romaji":
        return this.romaji || "";
      default:
        return "";
    }
  }

  /**
   * Check if flashcard has specific field
   * @param field Field name
   * @returns True if field has value
   */
  hasField(field: string): boolean {
    const value = this.getDisplayText(field);
    return value.trim() !== "";
  }

  /**
   * Generate unique ID
   * @returns Unique ID string
   */
  private generateId(): string {
    return `flashcard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
