'use client';

import { useState } from 'react';
import { FlashcardItem, UserSettings } from "@/core/api-client";
import { cn } from "@/core/utils";
import { WordDisplay } from './word-display';
import { HintDisplay } from './hint-display';

interface FlashcardDisplayProps {
  item: FlashcardItem;
  settings: UserSettings;
  isUserInteraction: boolean;
  mode: "flashcard";
}

export function FlashcardDisplay({
  item,
  settings,
  isUserInteraction,
  mode,
}: FlashcardDisplayProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const displayMode = settings.display_mode || "kana";
  const kanaType = settings.kana_type || "hiragana";

  const renderContent = () => {
    if (mode === "flashcard") {
      return (
        <div className="text-4xl md:text-6xl font-bold text-white mb-4">
          <div className="mb-2">
            <WordDisplay
              item={item}
              settings={settings}
              displayMode={displayMode}
              kanaType={kanaType}
            />
          </div>
          {displayMode !== "english" && item.english && isFlipped && (
            <HintDisplay
              text={Array.isArray(item.english) ? item.english[0] : item.english}
              className="text-2xl text-white/80"
            />
          )}
        </div>
      );
    } else {
      // Conjugation mode - show base form
      return (
        <>
          <div className="text-3xl md:text-5xl font-bold text-white mb-4">
            <WordDisplay
              item={item}
              settings={settings}
              displayMode="kanji"
            />
          </div>
          {item.type && item.english && (
            <HintDisplay
              text={Array.isArray(item.english) ? item.english[0] : item.english}
              type={item.type}
              className="text-lg text-white/80 mb-2"
            />
          )}
        </>
      );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div
        className={cn(
          "relative bg-gradient-to-br from-primary-purple/20 to-secondary-purple/20 backdrop-blur-sm rounded-lg p-8 min-h-[300px] flex items-center justify-center transition-all duration-300 border border-primary-purple/30 shadow-lg cursor-pointer",
          isUserInteraction && "opacity-75",
        )}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="text-center">{renderContent()}</div>
        {!isFlipped && (
          <p className="absolute bottom-4 text-white/60 text-sm">
            Click to reveal answer
          </p>
        )}
      </div>
    </div>
  );
}