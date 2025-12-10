import { UserSettings } from "@/core/api-client";
import { SettingsModel } from "../models/SettingsModel";
import { InputType } from "../types/AnswerTypes";

/**
 * SettingsService - Service layer for user settings management
 * Implements MVC pattern for settings business logic
 */
export class SettingsService {
  private baseUrl: string;
  private cache: Map<string, UserSettings> = new Map();
  private defaultSettings: UserSettings;

  constructor(baseUrl: string = "/api/settings") {
    this.baseUrl = baseUrl;
    this.defaultSettings = this.createDefaultSettings();
  }

  /**
   * Get settings for a module
   * @param moduleName Module name
   * @returns Promise<UserSettings> User settings
   */
  async getSettings(moduleName: string): Promise<UserSettings> {
    try {
      // Check cache first
      if (this.cache.has(moduleName)) {
        return this.cache.get(moduleName)!;
      }

      const response = await fetch(`${this.baseUrl}/${moduleName}`);

      if (!response.ok) {
        if (response.status === 404) {
          // Return default settings if not found
          const defaultSettings = this.getDefaultSettings(moduleName);
          await this.saveSettings(moduleName, defaultSettings);
          return defaultSettings;
        }
        throw new Error(`Failed to fetch settings for module: ${moduleName}`);
      }

      const settings = await response.json();

      // Cache the result
      this.cache.set(moduleName, settings);

      return settings;
    } catch (error) {
      console.error("Error fetching settings:", error);
      // Return default settings on error
      return this.getDefaultSettings(moduleName);
    }
  }

  /**
   * Update settings for a module
   * @param moduleName Module name
   * @param settings User settings to update
   * @returns Promise<void>
   */
  async updateSettings(
    moduleName: string,
    settings: UserSettings,
  ): Promise<void> {
    try {
      // Validate settings before saving
      if (!this.validateSettings(settings)) {
        throw new Error("Invalid settings provided");
      }

      await this.saveSettings(moduleName, settings);

      // Update cache
      this.cache.set(moduleName, settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      throw new Error(
        `Failed to update settings: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get default settings for a module
   * @param moduleName Module name
   * @returns UserSettings Default settings
   */
  getDefaultSettings(moduleName: string): UserSettings {
    const settingsModel = new SettingsModel();

    // Apply module-specific defaults
    this.applyModuleSpecificDefaults(settingsModel, moduleName);

    return settingsModel.toJSON();
  }

  /**
   * Validate settings
   * @param settings User settings to validate
   * @returns True if settings are valid
   */
  validateSettings(settings: UserSettings): boolean {
    try {
      const settingsModel = new SettingsModel(settings);
      const validation = settingsModel.validate();
      return validation.isValid;
    } catch (error) {
      console.error("Settings validation error:", error);
      return false;
    }
  }

  /**
   * Get settings with validation
   * @param moduleName Module name
   * @returns Promise<UserSettings> Validated settings
   */
  async getValidatedSettings(moduleName: string): Promise<UserSettings> {
    const settings = await this.getSettings(moduleName);

    if (!this.validateSettings(settings)) {
      console.warn("Invalid settings detected, returning defaults");
      return this.getDefaultSettings(moduleName);
    }

    return settings;
  }

  /**
   * Reset settings to defaults
   * @param moduleName Module name
   * @returns Promise<void>
   */
  async resetSettings(moduleName: string): Promise<void> {
    try {
      const defaultSettings = this.getDefaultSettings(moduleName);
      await this.updateSettings(moduleName, defaultSettings);
    } catch (error) {
      console.error("Error resetting settings:", error);
      throw new Error(
        `Failed to reset settings: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get settings for multiple modules
   * @param moduleNames Array of module names
   * @returns Promise<Record<string, UserSettings>> Settings for all modules
   */
  async getMultipleSettings(
    moduleNames: string[],
  ): Promise<Record<string, UserSettings>> {
    const settings: Record<string, UserSettings> = {};

    try {
      const promises = moduleNames.map(async (moduleName) => {
        const moduleSettings = await this.getSettings(moduleName);
        settings[moduleName] = moduleSettings;
      });

      await Promise.all(promises);
      return settings;
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
      const promises = Object.entries(settingsMap).map(
        ([moduleName, settings]) => this.updateSettings(moduleName, settings),
      );

      await Promise.all(promises);
    } catch (error) {
      console.error("Error updating multiple settings:", error);
      throw new Error(
        `Failed to update multiple settings: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get settings summary
   * @param moduleName Module name
   * @returns Settings summary object
   */
  async getSettingsSummary(moduleName: string): Promise<{
    moduleName: string;
    enabledInputTypes: string[];
    displayMode: string;
    practiceMode: string;
    difficulty: string;
    lastUpdated: Date;
  }> {
    try {
      const settings = await this.getSettings(moduleName);
      const settingsModel = new SettingsModel(settings);

      return {
        moduleName,
        enabledInputTypes: settingsModel.getEnabledInputTypes(),
        displayMode: settings.display_mode,
        practiceMode: settings.practice_mode,
        difficulty: settings.difficulty || "beginner",
        lastUpdated: new Date(), // This would come from the server in a real implementation
      };
    } catch (error) {
      console.error("Error getting settings summary:", error);
      throw new Error(
        `Failed to get settings summary: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Create default settings
   * @returns Default UserSettings
   */
  private createDefaultSettings(): UserSettings {
    const settingsModel = new SettingsModel();
    return settingsModel.toJSON();
  }

  /**
   * Apply module-specific defaults
   * @param settingsModel Settings model instance
   * @param moduleName Module name
   */
  private applyModuleSpecificDefaults(
    settingsModel: SettingsModel,
    moduleName: string,
  ): void {
    switch (moduleName) {
      case "hiragana":
        settingsModel.enableInputType(InputType.HIRAGANA);
        settingsModel.disableInputType(InputType.KANJI);
        break;
      case "katakana":
      case "katakana_words":
        settingsModel.enableInputType(InputType.KATAKANA);
        settingsModel.disableInputType(InputType.KANJI);
        break;
      case "verbs":
        settingsModel.enableInputType(InputType.HIRAGANA);
        settingsModel.enableInputType(InputType.KANJI);
        settingsModel.enableInputType(InputType.ENGLISH);
        break;
      default:
        // Use default settings for other modules
        break;
    }
  }

  /**
   * Save settings to server
   * @param moduleName Module name
   * @param settings Settings to save
   * @returns Promise<void>
   */
  private async saveSettings(
    moduleName: string,
    settings: UserSettings,
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${moduleName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error(`Failed to save settings for module: ${moduleName}`);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      throw new Error(
        `Failed to save settings: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Clear settings cache
   * @param moduleName Optional module name to clear specific cache
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
