'use client';

import { FeedbackTableProps } from "../../types/feedback";
import { getExpectedValue, getUserInput, getStatus } from "./utils";

export function FeedbackTable({
  enabledModes,
  userAnswers,
  item,
  frontendValidationResult,
  isCorrect,
  matchedType,
  convertedAnswer,
}: FeedbackTableProps) {
  const isMultipleInput = enabledModes.length > 1;
  const displayModes = frontendValidationResult?.results?.length && frontendValidationResult.results.length > 1
    ? enabledModes
    : matchedType ? [matchedType] : enabledModes;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left text-sm text-white/80 px-3 py-2 border-b border-white/20">
              Input Type
            </th>
            <th className="text-left text-sm text-white/80 px-3 py-2 border-b border-white/20">
              Your Answer
            </th>
            <th className="text-left text-sm text-white/80 px-3 py-2 border-b border-white/20">
              Expected
            </th>
            <th className="text-center text-sm text-white/80 px-3 py-2 border-b border-white/20">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {displayModes.map((mode) => {
            const userInput = getUserInput(mode, userAnswers[mode] || "", userAnswers, isMultipleInput);
            const expectedValue = getExpectedValue(mode, item);
            const isCorrectField = getStatus(mode, enabledModes, frontendValidationResult, isCorrect);

            return (
              <tr key={mode} className="border-b border-white/10">
                <td className="px-3 py-2 text-white/90 capitalize text-sm">
                  {mode}
                </td>
                <td className="px-3 py-2 text-white text-sm font-medium">
                  {userInput || "-"}
                </td>
                <td className="px-3 py-2 text-white/80 text-sm">
                  {expectedValue || "-"}
                </td>
                <td className="px-3 py-2 text-center">
                  <span
                    className={`text-lg ${isCorrectField ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {isCorrectField ? "✅" : "❌"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Additional Info */}
      {matchedType && (
        <div className="mt-3 pt-3 border-t border-white/20">
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Matched Type:</span>
            <span className="text-green-300 font-medium">{matchedType}</span>
          </div>
          {convertedAnswer && convertedAnswer !== userAnswers[matchedType] && (
            <div className="flex justify-between text-sm mt-1">
              <span className="text-white/70">Conversion Applied:</span>
              <span className="text-white/70">{convertedAnswer}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
