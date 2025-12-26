import {
  FlashcardItem,
  FlashcardSearchCriteria,
  FlashcardFilterOptions,
  WordType,
} from "../types/FlashcardTypes";
import { FlashcardModel } from "../models/FlashcardModel";

/**
 * FlashcardService - Service layer for flashcard data operations
 * Implements MVC pattern for business logic and API integration
 */
export class FlashcardService {
  private baseUrl: string;
  private cache: Map<string, FlashcardItem[]> = new Map();

  constructor(baseUrl: string = "/api/v2/words") {
    this.baseUrl = baseUrl;
  }

  /**
   * Get flashcards for a specific module
   * @param moduleName Name of the module
   * @returns Promise<FlashcardItem[]> Array of flashcard items
   */
  async getFlashcards(moduleName: string): Promise<FlashcardItem[]> {
    try {
      if (this.cache.has(moduleName)) {
        return this.cache.get(moduleName)!;
      }

      const response = await fetch(`${this.baseUrl}/${moduleName}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch flashcards for module: ${moduleName}`);
      }

      const data = await response.json();
      const words = data.words || [];

      const flashcards = words.map((word: any) => ({
        id: word.id,
        hiragana: word.hiragana,
        kanji: word.kanji,
        english: Array.isArray(word.english)
          ? word.english.join(", ")
          : word.english,
        type: word.type,
        difficulty: "beginner",
        furigana: word.furigana || word.hiragana,
        romaji: word.romaji || "",
      }));

      this.cache.set(moduleName, flashcards);
      return flashcards;
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      throw new Error(
        `Failed to fetch flashcards: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get a random flashcard from a module
   * @param moduleName Name of the module
   * @returns Promise<FlashcardItem> Random flashcard item
   */
  async getRandomFlashcard(moduleName: string): Promise<FlashcardItem> {
    try {
      const flashcards = await this.getFlashcards(moduleName);

      if (flashcards.length === 0) {
        throw new Error(`No flashcards found for module: ${moduleName}`);
      }

      const randomIndex = Math.floor(Math.random() * flashcards.length);
      return flashcards[randomIndex];
    } catch (error) {
      console.error("Error getting random flashcard:", error);
      throw new Error(
        `Failed to get random flashcard: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get a specific flashcard by ID
   * @param id Flashcard ID
   * @returns Promise<FlashcardItem> Flashcard item
   */
  async getFlashcardById(id: string): Promise<FlashcardItem> {
    try {
      const response = await fetch(`${this.baseUrl}/item/${id}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch flashcard with ID: ${id}`);
      }

      const flashcard = await response.json();
      return flashcard;
    } catch (error) {
      console.error("Error fetching flashcard by ID:", error);
      throw new Error(
        `Failed to fetch flashcard: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Search flashcards based on query and criteria
   * @param query Search query string
   * @param moduleName Name of the module
   * @param criteria Optional search criteria
   * @returns Promise<FlashcardItem[]> Array of matching flashcard items
   */
  async searchFlashcards(
    query: string,
    moduleName: string,
    criteria?: FlashcardSearchCriteria,
  ): Promise<FlashcardItem[]> {
    try {
      const flashcards = await this.getFlashcards(moduleName);

      if (!query.trim()) {
        return flashcards;
      }

      const searchTerm = query.toLowerCase();
      const filtered = flashcards.filter((flashcard) => {
        // Search in English
        const english = Array.isArray(flashcard.english)
          ? flashcard.english.join(" ")
          : flashcard.english;

        if (english.toLowerCase().includes(searchTerm)) {
          return true;
        }

        // Search in other fields
        if (flashcard.kanji && flashcard.kanji.includes(searchTerm)) {
          return true;
        }
        if (flashcard.hiragana && flashcard.hiragana.includes(searchTerm)) {
          return true;
        }
        if (flashcard.katakana && flashcard.katakana.includes(searchTerm)) {
          return true;
        }
        if (
          flashcard.romaji &&
          flashcard.romaji.toLowerCase().includes(searchTerm)
        ) {
          return true;
        }

        return false;
      });

      // Apply additional criteria if provided
      if (criteria) {
        return this.applySearchCriteria(filtered, criteria);
      }

      return filtered;
    } catch (error) {
      console.error("Error searching flashcards:", error);
      throw new Error(
        `Failed to search flashcards: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Apply search criteria to filter results
   * @param flashcards Array of flashcards to filter
   * @param criteria Search criteria
   * @returns Filtered array of flashcards
   */
  private applySearchCriteria(
    flashcards: FlashcardItem[],
    criteria: FlashcardSearchCriteria,
  ): FlashcardItem[] {
    return flashcards.filter((flashcard) => {
      if (criteria.type && flashcard.type !== criteria.type) {
        return false;
      }

      if (criteria.difficulty && flashcard.difficulty !== criteria.difficulty) {
        return false;
      }

      if (criteria.hasKanji !== undefined) {
        const hasKanji = !!flashcard.kanji;
        if (hasKanji !== criteria.hasKanji) {
          return false;
        }
      }

      if (criteria.hasHiragana !== undefined) {
        const hasHiragana = !!flashcard.hiragana;
        if (hasHiragana !== criteria.hasHiragana) {
          return false;
        }
      }

      if (criteria.hasKatakana !== undefined) {
        const hasKatakana = !!flashcard.katakana;
        if (hasKatakana !== criteria.hasKatakana) {
          return false;
        }
      }

      if (criteria.tags && criteria.tags.length > 0) {
        const hasMatchingTag = criteria.tags.some((tag) =>
          flashcard.tags?.includes(tag),
        );
        if (!hasMatchingTag) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Get flashcards with filtering and sorting options
   * @param moduleName Name of the module
   * @param options Filter and sort options
   * @returns Promise<FlashcardItem[]> Filtered and sorted flashcards
   */
  async getFlashcardsWithOptions(
    moduleName: string,
    options: FlashcardFilterOptions,
  ): Promise<FlashcardItem[]> {
    try {
      const flashcards = await this.getFlashcards(moduleName);

      let filtered = [...flashcards];

      // Apply sorting
      if (options.sortBy) {
        filtered.sort((a, b) => {
          let aValue: any;
          let bValue: any;

          switch (options.sortBy) {
            case "createdAt":
              aValue = new Date(a.createdAt || 0).getTime();
              bValue = new Date(b.createdAt || 0).getTime();
              break;
            case "updatedAt":
              aValue = new Date(a.updatedAt || 0).getTime();
              bValue = new Date(b.updatedAt || 0).getTime();
              break;
            case "difficulty":
              const difficultyOrder = {
                beginner: 1,
                intermediate: 2,
                advanced: 3,
              };
              aValue = difficultyOrder[a.difficulty || "beginner"];
              bValue = difficultyOrder[b.difficulty || "beginner"];
              break;
            case "type":
              aValue = a.type;
              bValue = b.type;
              break;
            default:
              return 0;
          }

          if (options.sortOrder === "desc") {
            return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
          } else {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
          }
        });
      }

      // Apply pagination
      if (options.offset || options.limit) {
        const offset = options.offset || 0;
        const limit = options.limit || filtered.length;
        filtered = filtered.slice(offset, offset + limit);
      }

      return filtered;
    } catch (error) {
      console.error("Error getting flashcards with options:", error);
      throw new Error(
        `Failed to get flashcards with options: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Clear cache for a specific module
   * @param moduleName Name of the module
   */
  clearCache(moduleName?: string): void {
    if (moduleName) {
      this.cache.delete(moduleName);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   * @returns Cache statistics object
   */
  getCacheStats(): { size: number; modules: string[] } {
    return {
      size: this.cache.size,
      modules: Array.from(this.cache.keys()),
    };
  }
}
