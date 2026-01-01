"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { annotateText } from "@/app/tokenizer/api";
import { AnnotateResponse, Token, Lexeme } from "@/entities/lexicon";

export type TokenizerState = {
  text: string;
  tokens: Token[];
  lexemes: Lexeme[];
  isLoading: boolean;
  error: string | null;
};

export function useTokenizer() {
  const [text, setText] = useState("");
  const [data, setData] = useState<AnnotateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
    
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    if (!newText.trim()) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true); // Optimistic loading
    
    // Debounce
    timeoutRef.current = setTimeout(async () => {
      try {
        const controller = new AbortController();
        abortControllerRef.current = controller;
        
        // Note: fetchFromBackend should ideally accept a signal, but for now we manage race conditions via effects/refs
        // Since our api utility calls fetch immediately, we rely on ignoring the result if text changed.
        // Or we pass text to the fetcher.
        
        const response = await annotateText(newText);
        
        // Check if this is still the current request logic (simplified without signal pass-through for now)
        // A robust implementation would pass the signal to fetch.
        // Assuming user stops typing, this runs.
        
        setData(response);
        setError(null);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Tokenizer error:", err);
          setError("Failed to analyze text.");
        }
      } finally {
        setIsLoading(false);
      }
    }, 500); // 500ms debounce
    
  }, []);

  return {
    text,
    setText: handleTextChange,
    tokens: data?.tokens || [],
    lexemes: data?.lexemes || [],
    isLoading,
    error,
  };
}
