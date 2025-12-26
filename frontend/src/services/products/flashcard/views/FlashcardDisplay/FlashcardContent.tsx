"use client";

import React from "react";
import { FlashcardItem } from "../../types/FlashcardTypes";
import { UserSettings } from "@/core/api-client";
import { FuriganaText, CharacterDisplay } from "@/components/japanese/core/display/furigana";

interface FlashcardContentProps {
  flashcard: FlashcardItem;
  settings: UserSettings;
  displayMode: "question" | "answer";
  mode: "flashcard";
}

export const FlashcardContent: React.FC<FlashcardContentProps> = ({
  flashcard,
  settings,
  displayMode,
  mode,
}) => {
  const renderJapaneseText = (text: string, furigana?: string) => {
    if (furigana) {
      const furiganaStyle = settings.furigana_style || "ruby";

      return (
        <FuriganaText
          text={text}
          reading={furigana}
          showReading={true}
          style={furiganaStyle === "ruby" ? "traditional" : "modern"}
          className="text-white"
          size="xl"
        />
      );
    }

    return (
      <CharacterDisplay
        character={text}
        size="xl"
        className="text-white"
      />
    );
  };

  const renderRomaji = (text: string, romaji?: string) => {
    if (!settings.romajiEnabled || !romaji) {
      return null;
    }

    return <div className="text-sm text-white/70 mt-2">{romaji}</div>;
  };

  const renderDisplayText = () => {
    const displayModeSetting = settings.display_mode || "kana";
    const kanaType = settings.kana_type || "hiragana";

    switch (displayModeSetting) {
      case "kanji":
        return flashcard.kanji
          ? renderJapaneseText(flashcard.kanji, flashcard.furigana)
          : null;
      case "kanji_furigana":
        return flashcard.kanji
          ? renderJapaneseText(flashcard.kanji, flashcard.furigana)
          : null;
      case "english":
        return <span className="text-white">{flashcard.english}</span>;
      case "kana":
      default:
        // Show hiragana or katakana based on kana_type setting
        if (kanaType === "katakana" && flashcard.katakana) {
          return renderJapaneseText(flashcard.katakana, flashcard.furigana);
        } else if (flashcard.hiragana) {
          return renderJapaneseText(flashcard.hiragana, flashcard.furigana);
        } else if (flashcard.katakana) {
          return renderJapaneseText(flashcard.katakana, flashcard.furigana);
        }
        return null;
    }
  };

  const renderFlashcardContent = () => {
    if (mode === "flashcard") {
      if (displayMode === "answer") {
        return (
          <>
            <div className="text-4xl md:text-6xl font-bold text-white mb-4">
              <div className="mb-2">{renderDisplayText()}</div>
              {settings.display_mode !== "english" && (
                <div className="text-2xl text-white/80">
                  {flashcard.english}
                </div>
              )}
            </div>
            <div className="text-sm text-white/70">Answer</div>
          </>
        );
      } else {
        return (
          <div className="text-4xl md:text-6xl font-bold text-white mb-4">
            <div className="mb-2">{renderDisplayText()}</div>
            {renderRomaji(
              flashcard.hiragana || flashcard.katakana || "",
              flashcard.romaji,
            )}
          </div>
        );
      }
    } else {
      // Conjugation mode - show base form
      return (
        <>
          <div className="text-3xl md:text-5xl font-bold text-white mb-4">
            {flashcard.kanji || flashcard.hiragana}
          </div>
          <div className="text-lg text-white/80 mb-2">
            {flashcard.type} - {flashcard.english}
          </div>
          {displayMode === "answer" && (
            <div className="text-2xl text-white font-semibold">
              Conjugation forms available
            </div>
          )}
        </>
      );
    }
  };

  return <div className="text-center">{renderFlashcardContent()}</div>;
};

export default FlashcardContent;
