"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserSettings } from "./api-client";

interface SettingsState {
  settings: Record<string, UserSettings>;
  getSettings: (moduleName: string) => UserSettings;
  updateSettings: (moduleName: string, settings: Partial<UserSettings>) => void;
  resetSettings: (moduleName: string) => void;
}

// Default settings for each module type
const getDefaultSettings = (moduleName: string): UserSettings => {
  const baseSettings: UserSettings = {
    flashcard_type: "translation",
    display_mode: "kana",
    kana_type: "hiragana",
    input_hiragana: true,
    input_romaji: false,
    input_katakana: false,
    input_kanji: false,
    input_english: true,
    furigana_style: "ruby",
    conjugation_forms: [],
    practice_mode: "standard",
    priority_filter: "all",
    learning_order: false,
    proportions: {
      kana: 0.4,
      kanji: 0.3,
      kanji_furigana: 0.2,
      english: 0.1,
    },
    romaji_enabled: false,
    romaji_output_type: "hiragana",
    max_answer_attempts: 3,
  };

  const moduleTypeMap: Record<string, Partial<UserSettings>> = {
    hiragana: {
      display_mode: "kana",
      kana_type: "hiragana",
      input_hiragana: true,
      input_katakana: false,
      input_kanji: false,
    },
    katakana: {
      display_mode: "kana",
      kana_type: "katakana",
      input_hiragana: false,
      input_katakana: true,
      input_kanji: false,
    },
    katakana_words: {
      display_mode: "kana",
      kana_type: "katakana",
      input_hiragana: false,
      input_katakana: true,
      input_kanji: false,
    },
    verbs: {
      display_mode: "kanji_furigana",
      input_hiragana: true,
      input_katakana: false,
      input_kanji: true,
      conjugation_forms: ["polite", "negative", "past", "past_negative"],
    },
    adjectives: {
      display_mode: "kanji_furigana",
      input_hiragana: true,
      input_katakana: false,
      input_kanji: true,
      conjugation_forms: ["polite", "negative", "past", "past_negative"],
    },
  };

  const moduleSettings = moduleTypeMap[moduleName] || {};
  return { ...baseSettings, ...moduleSettings };
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: {},

      getSettings: (moduleName: string) => {
        const state = get();
        return state.settings[moduleName] || getDefaultSettings(moduleName);
      },

      updateSettings: (
        moduleName: string,
        newSettings: Partial<UserSettings>,
      ) => {
        set((state) => ({
          settings: {
            ...state.settings,
            [moduleName]: {
              ...getDefaultSettings(moduleName),
              ...state.settings[moduleName],
              ...newSettings,
            },
          },
        }));
      },

      resetSettings: (moduleName: string) => {
        set((state) => ({
          settings: {
            ...state.settings,
            [moduleName]: getDefaultSettings(moduleName),
          },
        }));
      },
    }),
    {
      name: "benky-fy-settings",
      partialize: (state) => ({ settings: state.settings }),
    },
  ),
);
