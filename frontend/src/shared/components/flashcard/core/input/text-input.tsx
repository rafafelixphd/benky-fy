'use client';

import { forwardRef } from 'react';
import { cn } from "@/core/utils";
import { InputFieldProps } from "@/components/flashcard/types/input";

export const TextInput = forwardRef<HTMLInputElement, InputFieldProps>(({
  mode,
  value,
  onChange,
  onKeyDown,
  disabled,
  isSubmitting,
  feedbackColor = '',
}, ref) => {
  return (
    <input
      ref={ref}
      type="text"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={`Enter ${mode === 'answer' ? 'your' : mode} answer...`}
      disabled={disabled}
      className={cn(
        "w-full px-6 py-4 text-lg rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent disabled:opacity-50",
        isSubmitting && "opacity-50",
        feedbackColor,
      )}
    />
  );
});
