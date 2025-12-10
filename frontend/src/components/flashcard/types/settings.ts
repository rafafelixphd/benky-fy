export interface ModuleTypeInfo {
  hasKatakana: boolean;
  hasKanji: boolean;
  hasFurigana: boolean;
}

export interface DisplaySettings {
  display_mode?: string;
  kana_type?: string;
  furigana_style?: string;
}

export interface InputSettings {
  input_hiragana?: boolean;
  input_katakana?: boolean;
  input_kanji?: boolean;
  input_english?: boolean;
  input_romaji?: boolean;
}

export type FlashcardSettings = DisplaySettings & InputSettings;

export interface SettingsModalProps {
  moduleName: string;
  onClose: () => void;
}

export interface SettingsSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  indicatorColor: string;
  children: React.ReactNode;
}

export interface DisplaySettingsProps {
  settings: DisplaySettings;
  moduleType: ModuleTypeInfo;
  moduleName: string;
  onSettingChange: (key: string, value: any) => void;
}

export interface InputSettingsProps {
  settings: InputSettings;
  moduleType: ModuleTypeInfo;
  onSettingChange: (key: string, value: any) => void;
}
