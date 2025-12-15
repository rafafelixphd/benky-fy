'use client';

import { CharacterDisplayProps } from "@/components/japanese/types/display";
import { FuriganaText } from "./furigana-text";

export function CharacterDisplay({
  character,
  reading,
  size = "lg",
  showReading = true,
  className = "",
}: CharacterDisplayProps) {
  return (
    <div className={`inline-block ${className}`}>
      <FuriganaText
        text={character}
        reading={reading}
        size={size}
        showReading={showReading}
        position="top"
        style="traditional"
        hoverToShow={!showReading}
      />
    </div>
  );
}