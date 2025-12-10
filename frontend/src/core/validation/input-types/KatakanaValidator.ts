/**
 * Katakana Validator - Handles katakana character validation
 */

import {
  ValidationStrategy,
  ValidationResult,
} from "../core/ValidationStrategy";
import {
  createSuccessResult,
  createFailureResult,
} from "../core/ValidationResult";

export class KatakanaValidator implements ValidationStrategy {
  private romajiToKatakanaMap: Map<string, string> = new Map([
    // Basic katakana mappings
    ["a", "ア"],
    ["i", "イ"],
    ["u", "ウ"],
    ["e", "エ"],
    ["o", "オ"],
    ["ka", "カ"],
    ["ki", "キ"],
    ["ku", "ク"],
    ["ke", "ケ"],
    ["ko", "コ"],
    ["sa", "サ"],
    ["shi", "シ"],
    ["su", "ス"],
    ["se", "セ"],
    ["so", "ソ"],
    ["ta", "タ"],
    ["chi", "チ"],
    ["tsu", "ツ"],
    ["te", "テ"],
    ["to", "ト"],
    ["na", "ナ"],
    ["ni", "ニ"],
    ["nu", "ヌ"],
    ["ne", "ネ"],
    ["no", "ノ"],
    ["ha", "ハ"],
    ["hi", "ヒ"],
    ["fu", "フ"],
    ["he", "ヘ"],
    ["ho", "ホ"],
    ["ma", "マ"],
    ["mi", "ミ"],
    ["mu", "ム"],
    ["me", "メ"],
    ["mo", "モ"],
    ["ya", "ヤ"],
    ["yu", "ユ"],
    ["yo", "ヨ"],
    ["ra", "ラ"],
    ["ri", "リ"],
    ["ru", "ル"],
    ["re", "レ"],
    ["ro", "ロ"],
    ["wa", "ワ"],
    ["wo", "ヲ"],
    ["n", "ン"],
    // Extended katakana for foreign words
    ["ga", "ガ"],
    ["gi", "ギ"],
    ["gu", "グ"],
    ["ge", "ゲ"],
    ["go", "ゴ"],
    ["za", "ザ"],
    ["ji", "ジ"],
    ["zu", "ズ"],
    ["ze", "ゼ"],
    ["zo", "ゾ"],
    ["da", "ダ"],
    ["di", "ディ"],
    ["du", "ドゥ"],
    ["de", "デ"],
    ["do", "ド"],
    ["ba", "バ"],
    ["bi", "ビ"],
    ["bu", "ブ"],
    ["be", "ベ"],
    ["bo", "ボ"],
    ["pa", "パ"],
    ["pi", "ピ"],
    ["pu", "プ"],
    ["pe", "ペ"],
    ["po", "ポ"],
    // Small katakana
    ["kya", "キャ"],
    ["kyu", "キュ"],
    ["kyo", "キョ"],
    ["sha", "シャ"],
    ["shu", "シュ"],
    ["sho", "ショ"],
    ["cha", "チャ"],
    ["chu", "チュ"],
    ["cho", "チョ"],
    ["nya", "ニャ"],
    ["nyu", "ニュ"],
    ["nyo", "ニョ"],
    ["hya", "ヒャ"],
    ["hyu", "ヒュ"],
    ["hyo", "ヒョ"],
    ["mya", "ミャ"],
    ["myu", "ミュ"],
    ["myo", "ミョ"],
    ["rya", "リャ"],
    ["ryu", "リュ"],
    ["ryo", "リョ"],
    ["gya", "ギャ"],
    ["gyu", "ギュ"],
    ["gyo", "ギョ"],
    ["ja", "ジャ"],
    ["ju", "ジュ"],
    ["jo", "ジョ"],
    ["bya", "ビャ"],
    ["byu", "ビュ"],
    ["byo", "ビョ"],
    ["pya", "ピャ"],
    ["pyu", "ピュ"],
    ["pyo", "ピョ"],
  ]);

  /**
   * Validate katakana input
   * @param input User input
   * @param expected Expected katakana
   * @returns ValidationResult
   */
  validate(input: string, expected: string): ValidationResult {
    const normalizedInput = this.normalize(input);
    const normalizedExpected = this.normalize(expected);

    // Direct match
    if (normalizedInput === normalizedExpected) {
      return createSuccessResult("katakana", normalizedInput);
    }

    // Check if input is romaji that converts to expected katakana
    const convertedKatakana = this.convertRomajiToKatakana(normalizedInput);
    if (convertedKatakana === normalizedExpected) {
      return createSuccessResult("katakana", convertedKatakana, 0.9);
    }

    // Check if expected is romaji that converts to input katakana
    const convertedFromExpected =
      this.convertRomajiToKatakana(normalizedExpected);
    if (normalizedInput === convertedFromExpected) {
      return createSuccessResult("katakana", normalizedInput, 0.9);
    }

    // Partial match check
    const similarity = this.calculateSimilarity(
      normalizedInput,
      normalizedExpected,
    );
    if (similarity > 0.7) {
      return {
        isCorrect: false,
        matchedType: "katakana",
        feedback: [
          `Close! Expected: ${normalizedExpected}, Got: ${normalizedInput}`,
        ],
        confidence: similarity,
      };
    }

    return createFailureResult([
      `Incorrect. Expected: ${normalizedExpected}`,
      `You entered: ${normalizedInput}`,
    ]);
  }

  /**
   * Get supported types
   * @returns Array of supported types
   */
  getSupportedTypes(): string[] {
    return ["katakana", "romaji"];
  }

  /**
   * Normalize katakana input
   * @param input Input to normalize
   * @returns Normalized input
   */
  normalize(input: string): string {
    return input.trim().toLowerCase();
  }

  /**
   * Check if validator can handle the type
   * @param type Type to check
   * @returns True if supported
   */
  canHandle(type: string): boolean {
    return this.getSupportedTypes().includes(type.toLowerCase());
  }

  /**
   * Convert romaji to katakana
   * @param romaji Romaji input
   * @returns Converted katakana or original if no conversion found
   */
  private convertRomajiToKatakana(romaji: string): string {
    const normalized = romaji.toLowerCase().trim();

    // Check for exact match first
    if (this.romajiToKatakanaMap.has(normalized)) {
      return this.romajiToKatakanaMap.get(normalized)!;
    }

    // Try partial matches for compound sounds
    for (const [romajiKey, katakanaValue] of this.romajiToKatakanaMap) {
      if (normalized.includes(romajiKey)) {
        return normalized.replace(romajiKey, katakanaValue);
      }
    }

    return normalized; // Return original if no conversion found
  }

  /**
   * Calculate similarity between two strings
   * @param str1 First string
   * @param str2 Second string
   * @returns Similarity score (0-1)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    if (str1.length === 0 || str2.length === 0) return 0.0;

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   * @param str1 First string
   * @param str2 Second string
   * @returns Edit distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator, // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }
}
