'use client';

import { CharacterGridProps } from "@/components/japanese/types/display";

export function CharacterGrid({
  characters,
  onCharacterClick,
  selectedChar,
  showRomaji = true,
  showNotes = false,
  columns = 5,
  className = "",
}: CharacterGridProps) {
  return (
    <div 
      className={`grid gap-4 ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {characters.map((char, index) => (
        <button
          key={index}
          onClick={() => onCharacterClick?.(char.char)}
          className={`
            relative p-4 rounded-lg border transition-all duration-200
            ${selectedChar === char.char 
              ? 'bg-primary-purple/20 border-primary-purple/50 shadow-lg' 
              : 'bg-background/10 border-primary-foreground/20 hover:bg-background/20'
            }
          `}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-primary-foreground">
              {char.char}
            </span>
            {showRomaji && (
              <span className="text-sm text-primary-foreground/70">
                {char.romaji}
              </span>
            )}
            {showNotes && char.notes && (
              <span className="text-xs text-primary-foreground/50 mt-1">
                {char.notes}
              </span>
            )}
            {char.type && (
              <span 
                className={`
                  absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded
                  ${char.type === 'hiragana' 
                    ? 'bg-blue-500/20 text-blue-200' 
                    : 'bg-purple-500/20 text-purple-200'
                  }
                `}
              >
                {char.type}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
