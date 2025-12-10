/**
 * FlashcardTypes - Type definitions for flashcard system
 */

/**
 * Word type enumeration
 */
export enum WordType {
  VERB = "verb",
  ADJECTIVE = "adjective",
  NOUN = "noun",
  COLOR = "color",
  NUMBER = "number",
  GREETING = "greeting",
  DAY = "day",
  MONTH = "month",
  QUESTION = "question",
  VOCAB = "vocab",
}

/**
 * Flashcard display mode enumeration
 */
export enum FlashcardDisplayMode {
  KANJI = "kanji",
  HIRAGANA = "hiragana",
  KATAKANA = "katakana",
  ENGLISH = "english",
  MIXED = "mixed",
}

/**
 * Flashcard item interface
 */
export interface FlashcardItem {
  id: string;
  kanji?: string;
  hiragana?: string;
  katakana?: string;
  english: string | string[];
  type: WordType;
  furigana?: string;
  romaji?: string;
  pronunciation?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Flashcard module interface
 */
export interface FlashcardModule {
  id: string;
  name: string;
  description?: string;
  type: WordType;
  items: FlashcardItem[];
  totalItems: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Flashcard creation data interface
 */
export interface FlashcardCreateData {
  kanji?: string;
  hiragana?: string;
  katakana?: string;
  english: string | string[];
  type: WordType;
  furigana?: string;
  romaji?: string;
  pronunciation?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  tags?: string[];
}

/**
 * Flashcard update data interface
 */
export interface FlashcardUpdateData {
  kanji?: string;
  hiragana?: string;
  katakana?: string;
  english?: string | string[];
  type?: WordType;
  furigana?: string;
  romaji?: string;
  pronunciation?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  tags?: string[];
}

/**
 * Flashcard search criteria interface
 */
export interface FlashcardSearchCriteria {
  type?: WordType;
  difficulty?: "beginner" | "intermediate" | "advanced";
  tags?: string[];
  hasKanji?: boolean;
  hasHiragana?: boolean;
  hasKatakana?: boolean;
  searchText?: string;
}

/**
 * Flashcard filter options interface
 */
export interface FlashcardFilterOptions {
  sortBy?: "createdAt" | "updatedAt" | "difficulty" | "type";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}
