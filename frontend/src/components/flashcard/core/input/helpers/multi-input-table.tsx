'use client';

import { MultiInputTableProps } from "@/components/flashcard/types/input";
import { cn } from "@/core/utils";

export function MultiInputTable({
  modes,
  answers,
  disabled,
  isSubmitting,
  inputRefs,
  handleInputChange,
  handleKeyDown,
  getFeedbackColor,
}: MultiInputTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left text-sm text-white/80 px-4 py-2 border-b border-white/20">
              Input Type
            </th>
            <th className="text-left text-sm text-white/80 px-4 py-2 border-b border-white/20">
              Your Answer
            </th>
          </tr>
        </thead>
        <tbody>
          {modes.map((mode) => (
            <tr key={mode} className="border-b border-white/10">
              <td className="px-4 py-3 text-white/90 capitalize">{mode}</td>
              <td className="px-4 py-3">
                <input
                  ref={(el) => {
                    inputRefs.current[mode] = el;
                  }}
                  type="text"
                  value={answers[mode] || ""}
                  onChange={handleInputChange(mode)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Enter ${mode} answer...`}
                  disabled={disabled}
                  className={cn(
                    "w-full px-3 py-2 text-sm rounded bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-white/50 focus:border-transparent disabled:opacity-50",
                    isSubmitting && "opacity-50",
                    getFeedbackColor(mode),
                  )}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
