"use client";

import { useRef } from "react";
import { Lexeme, Token } from "@/entities/lexicon";
import { getPosColor } from "./TokenizerLegend";
import { romajiToHiragana } from "@/lib/utils/romaji-conversion";

type Props = {
  text: string;
  setText: (t: string) => void;
  tokens: Token[];
  lexemes: Lexeme[]; 
  isLoading: boolean;
};

export function TokenizerEditor({ text, setText, tokens, isLoading }: Props) {
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
      const colorClass = getPosColor(token.label);
      
      elements.push(
        <span
            key={`tok-${token.token_id}`}
            className={`${colorClass} rounded-sm px-[1px] mx-[-1px] border-b-2 border-transparent inline-block`}
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
    <div className="relative font-mono text-lg leading-relaxed min-h-[400px] h-fit w-full border rounded-md bg-white dark:bg-zinc-950 shadow-sm group">
      {/* Backdrop (Highlights) */}
      <div
        ref={backdropRef}
        className="absolute inset-0 p-4 whitespace-pre-wrap break-words pointer-events-none overflow-hidden"
      >
      
      </div>

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
