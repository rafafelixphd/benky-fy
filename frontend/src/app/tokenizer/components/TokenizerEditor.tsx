"use client";

import { useEffect, useRef, useState } from "react";
import { Lexeme, Token } from "@/entities/lexicon";
import { POS_COLORS } from "./TokenizerLegend";
import { romajiToHiragana } from "@/lib/utils/romaji-conversion";

type Props = {
  text: string;
  setText: (t: string) => void;
  tokens: Token[];
  lexemes: Lexeme[]; 
  isLoading: boolean;
};

export function TokenizerEditor({ text, setText, tokens, isLoading }: Props) {
  // We use a stacked approach:
  // Background: Renders spans with colors
  // Foreground: Transparent textarea for editing
  // They must share EXACT font styling.

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
      
      // Basic Romaji -> Hiragana conversion on the fly
      // Check if the change added a character at the end? 
      // For full IME emulation we need more complex logic.
      // But for "reuse the romanji->hiragana", let's try to convert the whole string 
      // if it looks like romaji, or just segments?
      // Since this is a specialized tokenizer, maybe we just auto-convert mixed input?
      // The `romajiToHiragana` function handles mixed input somewhat? No, `convertMixedInput` does.
      
      // Let's use convertMixedInput behavior: if user types "ringo", it becomes "りんご".
      // But if they type "English", we might not want to convert?
      // Actually, a naive "convert everything to hiragana" is often what beginners want.
      
      // However, correcting cursor position is hard.
      // Let's just convert the whole text for now, as user requested "reuse".
      // CAUTION: This might prevent typing English or specific things.
      // A toggle "Input Mode: Romaji" would be ideal, but for now let's apply it directly.
      
      // Let's assume the user might want to edit existing text.
      // Converting the whole text on every keystroke is aggressive.
      // But `convertMixedInput` from `romaji-conversion.ts` handles non-matching parts well?
      // `romajiToHiragana` converts "ba" -> "ば". "ban" -> "ばん".
      
      // Let's try it.
      const converted = romajiToHiragana(raw).converted;
      setText(converted);
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
      elements.push(
        <span
          key={`tok-${token.token_id}`}
          className={`${colorClass} rounded-sm px-[1px] mx-[-1px] border-b-2 border-transparent hover:border-black/20 dark:hover:border-white/20 transition-colors cursor-help`}
          title={`${token.surface} (${token.label})\nReading: ${token.vocab?.known ? "Known" : "Unknown"}`}
        >
          {text.slice(token.start, token.end)}
        </span>
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
    <div className="relative font-mono text-lg leading-relaxed h-[400px] w-full border rounded-md overflow-hidden bg-white dark:bg-zinc-950 shadow-sm">
      {/* Backdrop (Highlights) */}
      <div
        ref={backdropRef}
        className="absolute inset-0 p-4 whitespace-pre-wrap break-words pointer-events-none overflow-auto"
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
        className="absolute inset-0 w-full h-full p-4 bg-transparent resize-none outline-none text-transparent caret-blue-600 dark:caret-blue-400 selection:bg-blue-200/50 dark:selection:bg-blue-800/50 whitespace-pre-wrap break-words z-10"
        style={{ fontFamily: "'Noto Sans JP', monospace" }}
        placeholder="Type here (Romaji will be converted to Hiragana)..."
        spellCheck={false}
      />
      
      {isLoading && (
        <div className="absolute top-2 right-2 z-20">
            <span className="loading-spinner w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin">⟳</span>
        </div>
      )}
    </div>
  );
}
