/**
 * Multi-input validation utility functions
 * Provides color-coded feedback system for single and multiple input validation
 */

import { ValidationResult } from "./validation/core/ValidationResult";

// Re-export for backward compatibility
export type { ValidationResult };

/**
 * Parse multiple correct answers from a string
 * Handles formats like "to buy / to pay", "to buy, to pay", "buy, pay"
 * @param correctAnswerString The correct answer string that may contain multiple answers
 * @returns Array of normalized correct answers
 */
export const parseMultipleAnswers = (correctAnswerString: string): string[] => {
  if (!correctAnswerString) return [];

  // Split by both "/" and "," and clean up each answer
  const answers = correctAnswerString
    .split(/[\/,]/)
    .map((answer) => answer.trim())
    .filter((answer) => answer.length > 0);

  // Also add versions without "to " prefix for flexibility
  const flexibleAnswers = new Set<string>();

  answers.forEach((answer) => {
    // Add the original answer
    flexibleAnswers.add(answer.toLowerCase());

    // Add version without "to " prefix
    if (answer.toLowerCase().startsWith("to ")) {
      flexibleAnswers.add(answer.toLowerCase().substring(3));
    }

    // Add version with "to " prefix if it doesn't have it
    if (!answer.toLowerCase().startsWith("to ")) {
      flexibleAnswers.add(`to ${answer.toLowerCase()}`);
    }
  });

  return Array.from(flexibleAnswers);
};

/**
 * Check if user input matches any of the correct answers
 * @param userInput The user's input
 * @param correctAnswers Array of correct answers
 * @returns True if user input matches any correct answer
 */
export const matchesAnyAnswer = (
  userInput: string,
  correctAnswers: string[],
): boolean => {
  const normalizedUserInput = userInput.toLowerCase().trim();
  return correctAnswers.some(
    (correctAnswer) =>
      normalizedUserInput === correctAnswer.toLowerCase().trim(),
  );
};

/**
 * Get color-coded feedback classes based on validation results
 * @param results Array of boolean results for each input field
 * @returns Tailwind CSS classes for color feedback
 */
export const getFeedbackColor = (results: boolean[]): string => {
  const color = results.every(Boolean)
    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
    : results.some(Boolean)
      ? "bg-amber-500/20 border-amber-400 text-amber-300"
      : "bg-red-500/20 border-red-400 text-red-300";
  return color;
};

/**
 * Get timer duration based on validation results
 * @param results Array of boolean results for each input field
 * @returns Timer duration in milliseconds
 */
export const getTimerDuration = (results: boolean[]): number => {
  const duration = results.every(Boolean)
    ? 3000
    : results.some(Boolean)
      ? 8000
      : 10000;
  return duration;
};

/**
 * Validate single input mode (English only)
 * @param userAnswer User's input answer
 * @param item Flashcard item with correct answers
 * @returns Validation result with color feedback
 */
export const validateSingleInput = (
  userAnswer: string,
  item: { english: string | string[] },
): ValidationResult => {
  // Handle multiple correct answers for English
  const englishValue = Array.isArray(item.english)
    ? item.english.join(" / ")
    : item.english;
  const correctEnglishAnswers = parseMultipleAnswers(englishValue);
  const isCorrect = matchesAnyAnswer(userAnswer, correctEnglishAnswers);

  return {
    isCorrect,
    results: [isCorrect],
    feedbackColor: getFeedbackColor([isCorrect]),
    matchedType: isCorrect ? "english" : undefined,
    convertedAnswer: userAnswer.trim(),
    timerDuration: getTimerDuration([isCorrect]),
  };
};

/**
 * Comprehensive validation that respects user settings and input order
 * @param userAnswers Object with all possible input answers
 * @param item Flashcard item with correct answers
 * @param enabledModes Array of enabled input modes in order
 * @returns Validation result with color feedback
 */
export const validateWithSettings = (
  userAnswers: Record<string, string>,
  item: {
    english: string | string[];
    hiragana?: string;
    katakana?: string;
    kanji?: string;
  },
  enabledModes: string[],
): ValidationResult => {
  const results: boolean[] = [];

  // Validate each enabled mode in order
  for (const mode of enabledModes) {
    const userInput = userAnswers[mode] || "";
    let isCorrect = false;

    switch (mode) {
      case "hiragana":
        isCorrect = userInput.trim() === (item.hiragana || "").trim();
        break;
      case "katakana":
        isCorrect = userInput.trim() === (item.katakana || "").trim();
        break;
      case "kanji":
        isCorrect = userInput.trim() === (item.kanji || "").trim();
        break;
      case "english":
        // Handle multiple correct answers for English
        const englishValue = Array.isArray(item.english)
          ? item.english.join(" / ")
          : item.english || "";
        const correctEnglishAnswers = parseMultipleAnswers(englishValue);
        isCorrect = matchesAnyAnswer(userInput, correctEnglishAnswers);
        break;
      case "romaji":
        // Romaji typically converts to hiragana
        isCorrect = userInput.trim() === (item.hiragana || "").trim();
        break;
    }

    results.push(isCorrect);
  }

  const isCorrect = results.every(Boolean);

  const result = {
    isCorrect,
    results,
    feedbackColor: getFeedbackColor(results),
    matchedType: results.every(Boolean)
      ? "correct"
      : results.some(Boolean)
        ? "partial"
        : "incorrect",
    convertedAnswer: enabledModes
      .map((mode) => userAnswers[mode] || "")
      .join(" / "),
    timerDuration: getTimerDuration(results),
  };

  return result;
};

/**
 * Validate multiple input mode (English + Hiragana)
 * @param userAnswers Object with english and hiragana answers
 * @param item Flashcard item with correct answers
 * @param settings User settings to check which inputs are enabled
 * @returns Validation result with color feedback
 */
export const validateMultipleInput = (
  userAnswers: { english: string; hiragana: string },
  item: { english: string; hiragana: string },
  settings: { input_english: boolean; input_hiragana: boolean },
): ValidationResult => {
  const results: boolean[] = [];

  // Only validate fields that the user has enabled
  if (settings.input_english) {
    if (!userAnswers.english || userAnswers.english.trim() === "") {
      results.push(false); // English is enabled but empty
    } else {
      const englishCorrect = matchesAnyAnswer(
        userAnswers.english,
        parseMultipleAnswers(item.english),
      );
      results.push(englishCorrect);
    }
  }

  if (settings.input_hiragana) {
    if (!userAnswers.hiragana || userAnswers.hiragana.trim() === "") {
      results.push(false); // Hiragana is enabled but empty
    } else {
      const hiraganaCorrect =
        userAnswers.hiragana.trim() === item.hiragana.trim();
      results.push(hiraganaCorrect);
    }
  }

  const isCorrect = results.every(Boolean);

  return {
    isCorrect,
    results,
    feedbackColor: getFeedbackColor(results),
    matchedType: isCorrect
      ? "all"
      : results.some(Boolean)
        ? "partial"
        : undefined,
    convertedAnswer: `${userAnswers.english} / ${userAnswers.hiragana}`,
    timerDuration: getTimerDuration(results),
  };
};

/**
 * Enhanced validation that supports both single and multiple input modes
 * @param userAnswer Single answer string or object with multiple answers
 * @param item Flashcard item with correct answers
 * @param isMultipleInput Whether to use multiple input validation
 * @param settings User settings to check which inputs are enabled
 * @returns Validation result with color feedback
 */
export const validateAnswer = (
  userAnswer: string | { english: string; hiragana: string },
  item: { english: string | string[]; hiragana?: string },
  settings?: {
    input_english: boolean;
    input_hiragana: boolean;
    input_katakana?: boolean;
    input_kanji?: boolean;
    input_romaji?: boolean;
  },
  moduleName?: string,
): ValidationResult => {
  // Determine what input types are SUPPORTED by the module
  const moduleSupports = {
    katakana: moduleName === "katakana" || moduleName === "katakana_words",
    kanji: !["hiragana", "katakana", "katakana_words"].includes(
      moduleName || "",
    ),
    english: true, // All modules support English
    hiragana: true, // All modules support Hiragana
    romaji: true, // All modules support Romaji
  };

  // Determine what input types are ENABLED by the user (both supported AND enabled)
  const enabledInputs = [];
  if (settings?.input_english && moduleSupports.english)
    enabledInputs.push("english");
  if (settings?.input_hiragana && moduleSupports.hiragana)
    enabledInputs.push("hiragana");
  if (settings?.input_katakana && moduleSupports.katakana)
    enabledInputs.push("katakana");
  if (settings?.input_kanji && moduleSupports.kanji)
    enabledInputs.push("kanji");
  if (settings?.input_romaji && moduleSupports.romaji)
    enabledInputs.push("romaji");

  const isMultipleInput = enabledInputs.length > 1;

  if (
    isMultipleInput &&
    typeof userAnswer === "object" &&
    item.hiragana &&
    settings
  ) {
    return validateMultipleInput(
      userAnswer,
      item as { english: string; hiragana: string },
      settings,
    );
  } else {
    const answerString =
      typeof userAnswer === "string" ? userAnswer : userAnswer.english;
    return validateSingleInput(answerString, item);
  }
};
