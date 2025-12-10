import { UserSettings } from "@/core/api-client";
import { SettingsModel } from "../models/SettingsModel";
import { SettingsService } from "../services/SettingsService";
import { InputType } from "../types/AnswerTypes";

/**
 * SettingsController - Controller layer for settings user interactions
 * Implements MVC pattern for handling user settings management
 */
export class SettingsController {
  private settingsService: SettingsService;
  private currentSettings: SettingsModel | null = null;
  private currentModule: string | null = null;

  constructor(settingsService?: SettingsService) {
    this.settingsService = settingsService || new SettingsService();
  }

  /**
   * Load settings for a module
   * @param moduleName Module name to load settings for
   * @returns Promise<void>
   */
  async loadSettings(moduleName: string): Promise<void> {
    try {
      this.currentModule = moduleName;
      const settingsData = await this.settingsService.getSettings(moduleName);
      this.currentSettings = new SettingsModel(settingsData);
    } catch (error) {
      console.error("Error loading settings:", error);
      throw new Error(
        `Failed to load settings for module ${moduleName}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Update settings for current module
   * @param settings User settings to update
   * @returns Promise<void>
   */
  async updateSettings(settings: UserSettings): Promise<void> {
    if (!this.currentModule) {
      throw new Error("No current module set for settings update");
    }

    try {
      await this.settingsService.updateSettings(this.currentModule, settings);

      // Update current settings model
      this.currentSettings = new SettingsModel(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      throw new Error(
        `Failed to update settings: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Reset settings to defaults for current module
   * @returns Promise<void>
   */
  async resetSettings(): Promise<void> {
    if (!this.currentModule) {
      throw new Error("No current module set for settings reset");
    }

    try {
      await this.settingsService.resetSettings(this.currentModule);

      // Load default settings
      await this.loadSettings(this.currentModule);
    } catch (error) {
      console.error("Error resetting settings:", error);
      throw new Error(
        `Failed to reset settings: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get current settings
   * @returns UserSettings
   */
  getSettings(): UserSettings {
    if (!this.currentSettings) {
      throw new Error("No settings loaded. Call loadSettings() first.");
    }

    return this.currentSettings.toJSON();
  }

  /**
   * Get current module name
   * @returns string | null
   */
  getCurrentModule(): string | null {
    return this.currentModule;
  }

  /**
   * Get current settings model
   * @returns SettingsModel | null
   */
  getCurrentSettingsModel(): SettingsModel | null {
    return this.currentSettings;
  }

  /**
   * Check if settings are loaded
   * @returns boolean
   */
  hasSettings(): boolean {
    return this.currentSettings !== null;
  }

  /**
   * Enable an input type
   * @param inputType InputType to enable
   * @returns void
   */
  enableInputType(inputType: InputType): void {
    if (!this.currentSettings) {
      throw new Error("No settings loaded. Call loadSettings() first.");
    }

    this.currentSettings.allowedInputModes[inputType] = true;
  }

  /**
   * Disable an input type
   * @param inputType InputType to disable
   * @returns void
   */
  disableInputType(inputType: InputType): void {
    if (!this.currentSettings) {
      throw new Error("No settings loaded. Call loadSettings() first.");
    }

    this.currentSettings.allowedInputModes[inputType] = false;
  }

  /**
   * Check if an input type is enabled
   * @param inputType InputType to check
   * @returns boolean
   */
  isInputTypeEnabled(inputType: InputType): boolean {
    if (!this.currentSettings) {
      return false;
    }

    return this.currentSettings.allowedInputModes[inputType] || false;
  }

  /**
   * Get enabled input types
   * @returns string[]
   */
  getEnabledInputTypes(): string[] {
    if (!this.currentSettings) {
      return [];
    }

    return Object.keys(this.currentSettings.allowedInputModes).filter(
      (type) => this.currentSettings!.allowedInputModes[type],
    ) as InputType[];
  }

  /**
   * Set display mode
   * @param displayMode Display mode to set
   * @returns void
   */
  setDisplayMode(displayMode: string): void {
    if (!this.currentSettings) {
      throw new Error("No settings loaded. Call loadSettings() first.");
    }

    this.currentSettings.displayMode = displayMode as any;
  }

  /**
   * Get display mode
   * @returns string
   */
  getDisplayMode(): string {
    if (!this.currentSettings) {
      return "mixed";
    }

    return this.currentSettings.displayMode;
  }

  /**
   * Set practice mode
   * @param practiceMode Practice mode to set
   * @returns void
   */
  setPracticeMode(practiceMode: string): void {
    if (!this.currentSettings) {
      throw new Error("No settings loaded. Call loadSettings() first.");
    }

    this.currentSettings.practiceMode = practiceMode as any;
  }

  /**
   * Get practice mode
   * @returns string
   */
  getPracticeMode(): string {
    if (!this.currentSettings) {
      return "normal";
    }

    return this.currentSettings.practiceMode;
  }

  /**
   * Set difficulty level
   * @param difficulty Difficulty level to set
   * @returns void
   */
  setDifficulty(difficulty: string): void {
    if (!this.currentSettings) {
      throw new Error("No settings loaded. Call loadSettings() first.");
    }

    this.currentSettings.difficulty = difficulty as any;
  }

  /**
   * Get difficulty level
   * @returns string
   */
  getDifficulty(): string {
    if (!this.currentSettings) {
      return "beginner";
    }

    return this.currentSettings.difficulty;
  }

  /**
   * Toggle feedback setting
   * @returns void
   */
  toggleFeedback(): void {
    if (!this.currentSettings) {
      throw new Error("No settings loaded. Call loadSettings() first.");
    }

    // Toggle feedback - using autoAdvance as proxy
    this.currentSettings.autoAdvance = !this.currentSettings.autoAdvance;
  }

  /**
   * Check if feedback is enabled
   * @returns boolean
   */
  isFeedbackEnabled(): boolean {
    if (!this.currentSettings) {
      return true;
    }

    return this.currentSettings.autoAdvance;
  }

  /**
   * Toggle strict mode
   * @returns void
   */
  toggleStrictMode(): void {
    if (!this.currentSettings) {
      throw new Error("No settings loaded. Call loadSettings() first.");
    }

    // Toggle strict mode - using soundEnabled as proxy
    this.currentSettings.soundEnabled = !this.currentSettings.soundEnabled;
  }

  /**
   * Check if strict mode is enabled
   * @returns boolean
   */
  isStrictModeEnabled(): boolean {
    if (!this.currentSettings) {
      return false;
    }

    return this.currentSettings.soundEnabled;
  }

  /**
   * Validate current settings
   * @returns Validation result
   */
  validateSettings(): { isValid: boolean; errors: string[] } {
    if (!this.currentSettings) {
      return { isValid: false, errors: ["No settings loaded"] };
    }

    // Simple validation - check if required fields exist
    const isValid = !!(
      this.currentSettings.displayMode &&
      this.currentSettings.practiceMode &&
      this.currentSettings.difficulty
    );
    const errors: string[] = [];

    if (!this.currentSettings.displayMode)
      errors.push("Display mode is required");
    if (!this.currentSettings.practiceMode)
      errors.push("Practice mode is required");
    if (!this.currentSettings.difficulty) errors.push("Difficulty is required");

    return { isValid, errors };
  }

  /**
   * Get settings summary
   * @returns Settings summary
   */
  getSettingsSummary(): {
    moduleName: string;
    enabledInputTypes: string[];
    displayMode: string;
    practiceMode: string;
    difficulty: string;
    feedbackEnabled: boolean;
    strictModeEnabled: boolean;
  } {
    if (!this.currentSettings || !this.currentModule) {
      return {
        moduleName: "unknown",
        enabledInputTypes: [],
        displayMode: "mixed",
        practiceMode: "normal",
        difficulty: "beginner",
        feedbackEnabled: true,
        strictModeEnabled: false,
      };
    }

    return {
      moduleName: this.currentModule,
      enabledInputTypes: this.getEnabledInputTypes(),
      displayMode: this.getDisplayMode(),
      practiceMode: this.getPracticeMode(),
      difficulty: this.getDifficulty(),
      feedbackEnabled: this.isFeedbackEnabled(),
      strictModeEnabled: this.isStrictModeEnabled(),
    };
  }

  /**
   * Apply preset settings
   * @param preset Preset name to apply
   * @returns void
   */
  applyPreset(
    preset: "beginner" | "intermediate" | "advanced" | "custom",
  ): void {
    if (!this.currentSettings) {
      throw new Error("No settings loaded. Call loadSettings() first.");
    }

    switch (preset) {
      case "beginner":
        this.currentSettings.difficulty = "beginner";
        this.currentSettings.practiceMode = "flashcard";
        this.currentSettings.allowedInputModes[InputType.HIRAGANA] = true;
        this.currentSettings.allowedInputModes[InputType.ENGLISH] = true;
        this.currentSettings.allowedInputModes[InputType.KANJI] = false;
        break;

      case "intermediate":
        this.currentSettings.difficulty = "intermediate";
        this.currentSettings.practiceMode = "flashcard";
        this.currentSettings.allowedInputModes[InputType.HIRAGANA] = true;
        this.currentSettings.allowedInputModes[InputType.KATAKANA] = true;
        this.currentSettings.allowedInputModes[InputType.ENGLISH] = true;
        break;

      case "advanced":
        this.currentSettings.difficulty = "advanced";
        this.currentSettings.practiceMode = "quiz";
        this.currentSettings.allowedInputModes[InputType.HIRAGANA] = true;
        this.currentSettings.allowedInputModes[InputType.KATAKANA] = true;
        this.currentSettings.allowedInputModes[InputType.KANJI] = true;
        this.currentSettings.allowedInputModes[InputType.ENGLISH] = true;
        break;

      case "custom":
        // Keep current settings
        break;
    }
  }

  /**
   * Reset controller state
   * @returns void
   */
  reset(): void {
    this.currentSettings = null;
    this.currentModule = null;
  }

  /**
   * Save current settings
   * @returns Promise<void>
   */
  async saveCurrentSettings(): Promise<void> {
    if (!this.currentSettings || !this.currentModule) {
      throw new Error("No settings or module loaded");
    }

    try {
      const settingsData = this.currentSettings.toJSON();
      await this.settingsService.updateSettings(
        this.currentModule,
        settingsData,
      );
    } catch (error) {
      console.error("Error saving current settings:", error);
      throw new Error(
        `Failed to save settings: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get settings for multiple modules
   * @param moduleNames Array of module names
   * @returns Promise<Record<string, UserSettings>>
   */
  async getMultipleSettings(
    moduleNames: string[],
  ): Promise<Record<string, UserSettings>> {
    try {
      return await this.settingsService.getMultipleSettings(moduleNames);
    } catch (error) {
      console.error("Error getting multiple settings:", error);
      throw new Error(
        `Failed to get multiple settings: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Update settings for multiple modules
   * @param settingsMap Record of module name to settings
   * @returns Promise<void>
   */
  async updateMultipleSettings(
    settingsMap: Record<string, UserSettings>,
  ): Promise<void> {
    try {
      await this.settingsService.updateMultipleSettings(settingsMap);
    } catch (error) {
      console.error("Error updating multiple settings:", error);
      throw new Error(
        `Failed to update multiple settings: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
