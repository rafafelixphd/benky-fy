"use client";

import { useEffect, useRef, useState } from "react";
import { Lexeme, Token } from "@/entities/lexicon";
import { POS_COLORS } from "./TokenizerLegend";
import { romajiToHiragana } from "@/lib/utils/romaji-conversion";
import { TokenPopover } from "./TokenPopover";
import { Word } from "@/entities/word";

type Props = {
  text: string;
  setText: (t: string) => void;
  tokens: Token[];
  lexemes: Lexeme[]; 
  isLoading: boolean;
};

export function TokenizerEditor({ text, setText, tokens, isLoading }: Props) {
  // State for interaction mode
  const [isInteractive, setIsInteractive] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Sync scroll
  const handleScroll = () => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const raw = e.target.value;
      const converted = romajiToHiragana(raw).converted;
      setText(converted);
  };

  const handleTokenReplace = (token: Token, word: Word) => {
      // Replace only this token's range
      const newText = text.slice(0, token.start) + word.reading.kanji + text.slice(token.end);
      setText(newText);
  };

  // Render highlights
  const renderHighlights = () => {
    if (!tokens || tokens.length === 0) {
      return <span>{text}</span>;
    }

    const elements = [];
    let lastIndex = 0;

    tokens.forEach((token) => {
      // Un-tokenized text before this token (whitespace, etc)
      if (token.start > lastIndex) {
        elements.push(
          <span key={`gap-${lastIndex}`}>
            {text.slice(lastIndex, token.start)}
          </span>
        );
      }

      // The token itself
      const colorClass = POS_COLORS[token.label] || "bg-transparent";
      
      // Wrap in Popover
      // If interactive, cursor should be pointer. If not, text.
      const cursorClass = isInteractive ? "cursor-pointer pointer-events-auto" : "cursor-text pointer-events-none";

      elements.push(
        <TokenPopover 
            key={`tok-${token.token_id}`} 
            token={token}
            onReplace={(original, word) => handleTokenReplace(token, word)}
        >
            <span
              className={`${colorClass} rounded-sm px-[1px] mx-[-1px] border-b-2 border-transparent hover:border-black/20 dark:hover:border-white/20 transition-colors inline-block ${cursorClass}`}
            >
              {text.slice(token.start, token.end)}
            </span>
        </TokenPopover>
      );

      lastIndex = token.end;
    });

    // Remaining text
    if (lastIndex < text.length) {
      elements.push(
        <span key={`tail-${lastIndex}`}>{text.slice(lastIndex)}</span>
      );
    }

    return elements;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end items-center gap-2">
           <label className="text-sm text-muted-foreground flex items-center gap-2 cursor-pointer select-none">
             <span className={isInteractive ? "font-bold text-primary" : ""}>Hover/Click Mode</span>
             <input 
                type="checkbox" 
                checked={isInteractive} 
                onChange={() => setIsInteractive(!isInteractive)}
                className="toggle-checkbox w-10 h-5 bg-gray-300 rounded-full appearance-none relative checked:bg-primary transition-colors cursor-pointer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full after:shadow-sm after:transition-transform checked:after:translate-x-5"
             />
           </label>
      </div>

      {/* Main editor container: Removed overflow-hidden to allow popovers to escape */}
      <div className="relative font-mono text-lg leading-relaxed h-[400px] w-full border rounded-md bg-white dark:bg-zinc-950 shadow-sm group">
        {/* Backdrop (Highlights) */}
        {/* If Interactive: z-20. If Edit: z-0 */}
        <div
          ref={backdropRef}
          className={`absolute inset-0 p-4 whitespace-pre-wrap break-words overflow-auto transition-colors ${
            isInteractive ? "z-20 pointer-events-auto" : "pointer-events-none"
          }`}
          style={{ fontFamily: "'Noto Sans JP', monospace" }}
          aria-hidden="true"
        >
          <div className="text-gray-900 dark:text-gray-100 opacity-100">
             {renderHighlights()}
          </div>
        </div>

        {/* Foreground (Input) */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onScroll={handleScroll}
          disabled={isInteractive}
          className={`absolute inset-0 w-full h-full p-4 bg-transparent resize-none outline-none caret-blue-600 dark:caret-blue-400 selection:bg-blue-200/50 dark:selection:bg-blue-800/50 whitespace-pre-wrap break-words z-10 ${
             isInteractive ? "opacity-0 pointer-events-none" : "text-transparent"
          }`}
          style={{ fontFamily: "'Noto Sans JP', monospace" }}
          placeholder="Type here (Romaji will be converted to Hiragana)..."
          spellCheck={false}
        />
        
        {isLoading && (
          <div className="absolute top-2 right-2 z-30">
              <span className="loading-spinner w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin">⟳</span>
          </div>
        )}
      </div>
    </div>
  );
}
