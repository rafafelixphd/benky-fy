"use client";

import React, { useMemo } from "react";
import { FlashcardItem } from "../../types/FlashcardTypes";
import { UserSettings } from "@/core/api-client";
import { ValidationResult, getFeedbackColor } from "@/core/validation";

interface AnswerFeedbackProps {
  item: FlashcardItem;
  userAnswer: string;
  isCorrect: boolean;
  matchedType?: string;
  convertedAnswer?: string;
  settings: UserSettings;
  frontendValidationResult?: ValidationResult | null;
  userAnswers?: Record<string, string>;
  moduleName?: string;
}

export const AnswerFeedback: React.FC<AnswerFeedbackProps> = ({
  item,
  userAnswer,
  isCorrect,
  matchedType,
  convertedAnswer,
  settings,
  frontendValidationResult,
  userAnswers = {},
  moduleName,
}) => {
  // Get enabled input modes in the same order as AnswerInput component
  const getEnabledInputModes = () => {
    if (!settings) return [];

    const moduleType = getModuleType(moduleName);
    const modes = [];

    if (settings.input_hiragana) modes.push("hiragana");
    if (settings.input_katakana && moduleType.hasKatakana)
      modes.push("katakana");
    if (settings.input_kanji && moduleType.hasKanji) modes.push("kanji");
    if (settings.input_english) modes.push("english");
    if (settings.input_romaji) modes.push("romaji");

    return modes;
  };

  const getModuleType = (moduleName?: string) => {
    if (!moduleName)
      return {
        hasKatakana: false,
        hasKanji: false,
        hasFurigana: false,
        isConjugationModule: false,
      };

    const moduleTypeMap: Record<
      string,
      {
        hasKatakana: boolean;
        hasKanji: boolean;
        hasFurigana: boolean;
        isConjugationModule: boolean;
      }
    > = {
      hiragana: {
        hasKatakana: false,
        hasKanji: false,
        hasFurigana: false,
        isConjugationModule: false,
      },
      katakana: {
        hasKatakana: true,
        hasKanji: false,
        hasFurigana: false,
        isConjugationModule: false,
      },
      katakana_words: {
        hasKatakana: true,
        hasKanji: false,
        hasFurigana: false,
        isConjugationModule: false,
      },
      verbs: {
        hasKatakana: false,
        hasKanji: true,
        hasFurigana: true,
        isConjugationModule: true,
      },
      adjectives: {
        hasKatakana: false,
        hasKanji: true,
        hasFurigana: true,
        isConjugationModule: true,
      },
      base_nouns: {
        hasKatakana: false,
        hasKanji: true,
        hasFurigana: true,
        isConjugationModule: false,
      },
      colors_basic: {
        hasKatakana: false,
        hasKanji: true,
        hasFurigana: true,
        isConjugationModule: false,
      },
      days_of_week: {
        hasKatakana: false,
        hasKanji: true,
        hasFurigana: true,
        isConjugationModule: false,
      },
      greetings_essential: {
        hasKatakana: false,
        hasKanji: true,
        hasFurigana: true,
        isConjugationModule: false,
      },
      months_complete: {
        hasKatakana: false,
        hasKanji: true,
        hasFurigana: true,
        isConjugationModule: false,
      },
      numbers_basic: {
        hasKatakana: false,
        hasKanji: true,
        hasFurigana: true,
        isConjugationModule: false,
      },
      numbers_extended: {
        hasKatakana: false,
        hasKanji: true,
        hasFurigana: true,
        isConjugationModule: false,
      },
      question_words: {
        hasKatakana: false,
        hasKanji: true,
        hasFurigana: true,
        isConjugationModule: false,
      },
      vocab: {
        hasKatakana: false,
        hasKanji: true,
        hasFurigana: true,
        isConjugationModule: false,
      },
    };

    return (
      moduleTypeMap[moduleName] || {
        hasKatakana: false,
        hasKanji: true,
        hasFurigana: true,
        isConjugationModule: false,
      }
    );
  };

  const enabledModes = getEnabledInputModes();
  const isMultipleInput = enabledModes.length > 1;

  // Get feedback color for the container background (memoized)
  const containerFeedbackColor = useMemo(() => {
    if (
      frontendValidationResult &&
      frontendValidationResult.results &&
      frontendValidationResult.results.length > 1
    ) {
      // Multiple input mode - use results array
      return getFeedbackColor(frontendValidationResult.results);
    } else if (frontendValidationResult) {
      // Single input mode - use overall result
      return getFeedbackColor([frontendValidationResult.isCorrect]);
    }
    // Fallback to overall isCorrect
    return getFeedbackColor([isCorrect]);
  }, [frontendValidationResult, isCorrect]);

  // Get expected values for each input type
  const getExpectedValue = (mode: string) => {
    switch (mode) {
      case "hiragana":
        return item.hiragana || "";
      case "katakana":
        return item.katakana || "";
      case "kanji":
        return item.kanji || "";
      case "english":
        return item.english || "";
      case "romaji":
        return item.hiragana || ""; // Romaji typically converts to hiragana
      default:
        return "";
    }
  };

  // Get user input for each mode
  const getUserInput = (mode: string) => {
    if (isMultipleInput && userAnswers[mode]) {
      return userAnswers[mode];
    }
    return userAnswer;
  };

  // Get status for each input type
  const getStatus = (mode: string) => {
    if (
      frontendValidationResult &&
      frontendValidationResult.results &&
      frontendValidationResult.results.length > 1
    ) {
      // Multiple input mode - check individual results
      const modeIndex = enabledModes.indexOf(mode);
      return frontendValidationResult.results[modeIndex] || false;
    } else if (frontendValidationResult) {
      // Single input mode - use overall result
      return frontendValidationResult.isCorrect;
    }
    return isCorrect;
  };

  return (
    <div className={`mt-4 p-4 rounded-lg border ${containerFeedbackColor}`}>
      <h4 className="text-sm font-medium text-white mb-3">Answer Feedback</h4>

      {/* Feedback Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-sm text-white/80 px-3 py-2 border-b border-white/20">
                Input Type
              </th>
              <th className="text-left text-sm text-white/80 px-3 py-2 border-b border-white/20">
                Input
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
            {enabledModes.map((mode) => {
              const userInput = getUserInput(mode);
              const expectedValue = getExpectedValue(mode);
              const isCorrectField = getStatus(mode);

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
      </div>

      {/* Additional Info */}
      {matchedType && (
        <div className="mt-3 pt-3 border-t border-white/20">
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Matched Type:</span>
            <span className="text-green-300 font-medium">{matchedType}</span>
          </div>
          {convertedAnswer && convertedAnswer !== userAnswer && (
            <div className="flex justify-between text-sm mt-1">
              <span className="text-white/70">Conversion Applied:</span>
              <span className="text-white/70">{convertedAnswer}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnswerFeedback;
