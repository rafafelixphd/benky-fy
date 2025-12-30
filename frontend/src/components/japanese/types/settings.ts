export type FuriganaStyle = "modern" | "traditional";
export type FuriganaPosition = "top" | "bottom";
export type FuriganaSize = "sm" | "md" | "lg";

export interface FuriganaSettings {
  style: FuriganaStyle;
  position: FuriganaPosition;
  size: FuriganaSize;
  showReading: boolean;
}

export interface JapaneseSettings extends FuriganaSettings {
  kanaType: "hiragana" | "katakana";
  romajiEnabled: boolean;
  displayMode: "kanji" | "kana" | "english";
}
