'use client';

import { useState } from 'react';
import { Button } from "@/shared/components/ui/button";
import { X, Settings as SettingsIcon } from "lucide-react";
import { WordTypeSelector } from './word-type-selector';
import { DisplayConfig } from './display-config';
import { InputConfig } from './input-config';
import { ModuleSelector, type ModuleConfig } from './module-selector';

export interface CustomFlashcardSettingsModalProps {
  onClose: () => void;
  onSave: (settings: CustomFlashcardSettings) => void;
}

export interface CustomFlashcardSettings {
  modules: ModuleConfig[];
  wordTypes: {
    hiragana: boolean;
    katakana: boolean;
    kanji: boolean;
    english: boolean;
  };
  wordWeights: {
    hiragana: number;
    katakana: number;
    kanji: number;
    english: number;
  };
  displayModes: {
    kana: boolean;
    kanji: boolean;
    kanji_furigana: boolean;
    english: boolean;
  };
  displayWeights: {
    kana: number;
    kanji: number;
    kanji_furigana: number;
    english: number;
  };
  inputModes: {
    hiragana: boolean;
    katakana: boolean;
    kanji: boolean;
    romaji: boolean;
    english: boolean;
  };
  inputWeights: {
    hiragana: number;
    katakana: number;
    kanji: number;
    romaji: number;
    english: number;
  };
}

const defaultSettings: CustomFlashcardSettings = {
  modules: [
    // Foundations
    { id: "hiragana", name: "Hiragana", enabled: true, weight: 25, category: "foundations", difficulty: "Beginner", cardCount: 46 },
    { id: "katakana", name: "Katakana", enabled: true, weight: 25, category: "foundations", difficulty: "Beginner", cardCount: 46 },
    { id: "katakana_words", name: "Katakana Words", enabled: false, weight: 0, category: "foundations", difficulty: "Intermediate", cardCount: 20 },

    // Numbers & Time
    { id: "numbers_basic", name: "Basic Numbers", enabled: true, weight: 20, category: "numbers-time", difficulty: "Beginner", cardCount: 10 },
    { id: "numbers_extended", name: "Extended Numbers", enabled: false, weight: 0, category: "numbers-time", difficulty: "Intermediate", cardCount: 20 },
    { id: "days_of_week", name: "Days of Week", enabled: true, weight: 15, category: "numbers-time", difficulty: "Beginner", cardCount: 7 },
    { id: "months_complete", name: "Months", enabled: false, weight: 0, category: "numbers-time", difficulty: "Beginner", cardCount: 12 },

    // Essential Vocabulary
    { id: "greetings_essential", name: "Greetings", enabled: true, weight: 15, category: "essential-vocab", difficulty: "Beginner", cardCount: 15 },
    { id: "question_words", name: "Question Words", enabled: false, weight: 0, category: "essential-vocab", difficulty: "Beginner", cardCount: 12 },
    { id: "base_nouns", name: "Basic Nouns", enabled: false, weight: 0, category: "essential-vocab", difficulty: "Beginner", cardCount: 25 },
    { id: "colors_basic", name: "Colors", enabled: false, weight: 0, category: "essential-vocab", difficulty: "Beginner", cardCount: 10 },

    // Grammar & Structure
    { id: "adjectives", name: "Adjectives", enabled: false, weight: 0, category: "grammar-structure", difficulty: "Intermediate", cardCount: 30 },
    { id: "verbs", name: "Japanese Verbs", enabled: false, weight: 0, category: "grammar-structure", difficulty: "Intermediate", cardCount: 50 },
    { id: "vocab", name: "Vocabulary", enabled: false, weight: 0, category: "grammar-structure", difficulty: "Intermediate", cardCount: 40 },
  ],
  wordTypes: {
    hiragana: true,
    katakana: true,
    kanji: false,
    english: true,
  },
  wordWeights: {
    hiragana: 40,
    katakana: 30,
    kanji: 0,
    english: 30,
  },
  displayModes: {
    kana: true,
    kanji: false,
    kanji_furigana: false,
    english: true,
  },
  displayWeights: {
    kana: 70,
    kanji: 0,
    kanji_furigana: 0,
    english: 30,
  },
  inputModes: {
    hiragana: true,
    katakana: true,
    kanji: false,
    romaji: true,
    english: true,
  },
  inputWeights: {
    hiragana: 25,
    katakana: 25,
    kanji: 0,
    romaji: 25,
    english: 25,
  },
};

export function CustomFlashcardSettingsModal({
  onClose,
  onSave,
}: CustomFlashcardSettingsModalProps) {
  const [settings, setSettings] = useState<CustomFlashcardSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleModuleChange = (modules: ModuleConfig[]) => {
    setSettings(prev => ({
      ...prev,
      modules,
    }));
  };

  const handleWordTypeChange = (type: string, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      wordTypes: {
        ...prev.wordTypes,
        [type]: enabled,
      },
    }));
  };

  const handleWordWeightChange = (type: string, weight: number) => {
    setSettings(prev => ({
      ...prev,
      wordWeights: {
        ...prev.wordWeights,
        [type]: weight,
      },
    }));
  };

  const handleDisplayModeChange = (mode: string, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      displayModes: {
        ...prev.displayModes,
        [mode]: enabled,
      },
    }));
  };

  const handleDisplayWeightChange = (mode: string, weight: number) => {
    setSettings(prev => ({
      ...prev,
      displayWeights: {
        ...prev.displayWeights,
        [mode]: weight,
      },
    }));
  };

  const handleInputModeChange = (mode: string, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      inputModes: {
        ...prev.inputModes,
        [mode]: enabled,
      },
    }));
  };

  const handleInputWeightChange = (mode: string, weight: number) => {
    setSettings(prev => ({
      ...prev,
      inputWeights: {
        ...prev.inputWeights,
        [mode]: weight,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(settings);
      onClose();
    } catch (error) {
      console.error("Failed to save custom flashcard settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Custom Flashcard Settings</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <ModuleSelector
            modules={settings.modules}
            onModulesChange={handleModuleChange}
          />

          <WordTypeSelector
            wordTypes={settings.wordTypes}
            weights={settings.wordWeights}
            onWordTypeChange={handleWordTypeChange}
            onWeightChange={handleWordWeightChange}
          />

          <DisplayConfig
            displayModes={settings.displayModes}
            modeWeights={settings.displayWeights}
            onDisplayModeChange={handleDisplayModeChange}
            onModeWeightChange={handleDisplayWeightChange}
          />

          <InputConfig
            inputModes={settings.inputModes}
            modeWeights={settings.inputWeights}
            onInputModeChange={handleInputModeChange}
            onModeWeightChange={handleInputWeightChange}
          />
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button onClick={handleSave} disabled={isSaving} className="flex-1">
            {isSaving ? "Saving..." : "Save Configuration"}
          </Button>
          <Button variant="outline" onClick={handleReset} disabled={isSaving}>
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
}
