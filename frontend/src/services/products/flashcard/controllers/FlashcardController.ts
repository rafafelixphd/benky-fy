import { FlashcardItem, WordType } from "../types/FlashcardTypes";
import { FlashcardService } from "../services/FlashcardService";

/**
 * FlashcardController - Controller layer for flashcard user interactions
 * Implements MVC pattern for handling user input and coordinating services
 */
export class FlashcardController {
  private flashcardService: FlashcardService;
  private currentFlashcard: FlashcardItem | null = null;
  private currentModule: string | null = null;
  private flashcards: FlashcardItem[] = [];
  private currentIndex: number = 0;

  constructor(flashcardService?: FlashcardService) {
    this.flashcardService = flashcardService || new FlashcardService();
  }

  /**
   * Load flashcards for a specific module
   * @param moduleName Name of the module to load
   * @returns Promise<void>
   */
  async loadFlashcards(moduleName: string): Promise<void> {
    try {
      this.currentModule = moduleName;
      this.flashcards = await this.flashcardService.getFlashcards(moduleName);
      this.currentIndex = 0;

      if (this.flashcards.length > 0) {
        this.currentFlashcard = this.flashcards[0];
      } else {
        this.currentFlashcard = null;
      }
    } catch (error) {
      console.error("Error loading flashcards:", error);
      throw new Error(
        `Failed to load flashcards for module ${moduleName}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Load a random flashcard from a module
   * @param moduleName Name of the module
   * @returns Promise<void>
   */
  async loadRandomFlashcard(moduleName: string): Promise<void> {
    try {
      this.currentModule = moduleName;
      this.currentFlashcard =
        await this.flashcardService.getRandomFlashcard(moduleName);

      // Find the index of the random flashcard in the loaded flashcards
      if (this.flashcards.length > 0) {
        this.currentIndex = this.flashcards.findIndex(
          (card) => card.id === this.currentFlashcard?.id,
        );
        if (this.currentIndex === -1) {
          this.currentIndex = 0;
        }
      }
    } catch (error) {
      console.error("Error loading random flashcard:", error);
      throw new Error(
        `Failed to load random flashcard for module ${moduleName}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Move to the next flashcard
   * @returns void
   */
  nextFlashcard(): void {
    if (this.flashcards.length === 0) {
      return;
    }

    this.currentIndex = (this.currentIndex + 1) % this.flashcards.length;
    this.currentFlashcard = this.flashcards[this.currentIndex];
  }

  /**
   * Move to the previous flashcard
   * @returns void
   */
  previousFlashcard(): void {
    if (this.flashcards.length === 0) {
      return;
    }

    this.currentIndex =
      this.currentIndex === 0
        ? this.flashcards.length - 1
        : this.currentIndex - 1;
    this.currentFlashcard = this.flashcards[this.currentIndex];
  }

  /**
   * Skip the current flashcard (move to next)
   * @returns void
   */
  skipFlashcard(): void {
    this.nextFlashcard();
  }

  /**
   * Get the current flashcard
   * @returns FlashcardItem | null
   */
  getCurrentFlashcard(): FlashcardItem | null {
    return this.currentFlashcard;
  }

  /**
   * Get the current module name
   * @returns string | null
   */
  getCurrentModule(): string | null {
    return this.currentModule;
  }

  /**
   * Get all loaded flashcards
   * @returns FlashcardItem[]
   */
  getAllFlashcards(): FlashcardItem[] {
    return [...this.flashcards];
  }

  /**
   * Get the current flashcard index
   * @returns number
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Get the total number of flashcards
   * @returns number
   */
  getTotalCount(): number {
    return this.flashcards.length;
  }

  /**
   * Check if there are flashcards loaded
   * @returns boolean
   */
  hasFlashcards(): boolean {
    return this.flashcards.length > 0;
  }

  /**
   * Check if there's a current flashcard
   * @returns boolean
   */
  hasCurrentFlashcard(): boolean {
    return this.currentFlashcard !== null;
  }

  /**
   * Get flashcards by type
   * @param type WordType to filter by
   * @returns FlashcardItem[]
   */
  getFlashcardsByType(type: WordType): FlashcardItem[] {
    return this.flashcards.filter((flashcard) => flashcard.type === type);
  }

  /**
   * Get flashcards by difficulty
   * @param difficulty Difficulty level to filter by
   * @returns FlashcardItem[]
   */
  getFlashcardsByDifficulty(
    difficulty: "beginner" | "intermediate" | "advanced",
  ): FlashcardItem[] {
    return this.flashcards.filter(
      (flashcard) => flashcard.difficulty === difficulty,
    );
  }

  /**
   * Jump to a specific flashcard by index
   * @param index Index to jump to
   * @returns boolean Success status
   */
  jumpToFlashcard(index: number): boolean {
    if (index >= 0 && index < this.flashcards.length) {
      this.currentIndex = index;
      this.currentFlashcard = this.flashcards[index];
      return true;
    }
    return false;
  }

  /**
   * Jump to a specific flashcard by ID
   * @param id Flashcard ID to jump to
   * @returns boolean Success status
   */
  jumpToFlashcardById(id: string): boolean {
    const index = this.flashcards.findIndex((flashcard) => flashcard.id === id);
    if (index !== -1) {
      return this.jumpToFlashcard(index);
    }
    return false;
  }

  /**
   * Reset the controller state
   * @returns void
   */
  reset(): void {
    this.currentFlashcard = null;
    this.currentModule = null;
    this.flashcards = [];
    this.currentIndex = 0;
  }

  /**
   * Refresh flashcards for the current module
   * @returns Promise<void>
   */
  async refreshFlashcards(): Promise<void> {
    if (this.currentModule) {
      await this.loadFlashcards(this.currentModule);
    }
  }

  /**
   * Get controller state information
   * @returns Object with controller state
   */
  getState(): {
    currentFlashcard: FlashcardItem | null;
    currentModule: string | null;
    currentIndex: number;
    totalCount: number;
    hasFlashcards: boolean;
  } {
    return {
      currentFlashcard: this.currentFlashcard,
      currentModule: this.currentModule,
      currentIndex: this.currentIndex,
      totalCount: this.flashcards.length,
      hasFlashcards: this.flashcards.length > 0,
    };
  }
}
