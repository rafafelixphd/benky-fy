'use client';

import { FlashcardItem, UserSettings } from "@/core/api-client";
import { FuriganaText, CharacterDisplay } from "@/components/japanese/core/display/furigana";

interface WordDisplayProps {
  item: FlashcardItem;
  settings: UserSettings;
  displayMode?: string;
  kanaType?: string;
  className?: string;
}

export function WordDisplay({
  item,
  settings,
  displayMode = 'kana',
  kanaType = 'hiragana',
  className = '',
}: WordDisplayProps) {
  const renderJapaneseText = (text: string, furigana?: string, hiragana?: string) => {
    const furiganaStyle = settings.furigana_style || "ruby";
    const isHoverMode = furiganaStyle === "hover";
    
    if (text === item.kanji) {
      return (
        <div className="flex flex-col items-center gap-4">
          <FuriganaText
            text={text}
            reading={hiragana}
            showReading={!isHoverMode}
            hoverToShow={isHoverMode}
            style={furiganaStyle === "ruby" ? "traditional" : "modern"}
            className={className || "text-white"}
            size="xl"
          />
        </div>
      );
    }

    // For non-kanji (hiragana/katakana), just show the text
    return (
      <CharacterDisplay
        character={text}
        size="xl"
        className={className || "text-white"}
      />
    );
  };

  const renderDisplayText = () => {
    switch (displayMode) {
      case "kanji":
      case "kanji_furigana":
        return item.kanji
          ? renderJapaneseText(item.kanji, item.furigana, item.hiragana)
          : null;
      case "english":
        return <span className={className || "text-white"}>{item.english}</span>;
      case "kana":
      default:
        if (kanaType === "katakana" && item.katakana) {
          return renderJapaneseText(item.katakana, item.furigana, item.hiragana);
        } else if (item.hiragana) {
          return renderJapaneseText(item.hiragana, item.furigana);
        } else if (item.katakana) {
          return renderJapaneseText(item.katakana, item.furigana, item.hiragana);
        }
        return null;
    }
  };

  return renderDisplayText();
}