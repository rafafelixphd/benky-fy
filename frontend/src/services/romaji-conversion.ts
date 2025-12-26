/**
 * Romaji to Kana conversion utilities
 * Supports basic romaji to hiragana/katakana conversion
 */

export interface ConversionOptions {
  outputType: "hiragana" | "katakana";
  strictMode?: boolean;
}

export interface ConversionResult {
  original: string;
  converted: string;
  isValid: boolean;
  errors?: string[];
}

// Basic romaji to hiragana mapping
const ROMAJI_TO_HIRAGANA: Record<string, string> = {
  // Vowels
  a: "あ",
  i: "い",
  u: "う",
  e: "え",
  o: "お",

  // K series
  ka: "か",
  ki: "き",
  ku: "く",
  ke: "け",
  ko: "こ",
  kya: "きゃ",
  kyu: "きゅ",
  kyo: "きょ",

  // S series
  sa: "さ",
  shi: "し",
  su: "す",
  se: "せ",
  so: "そ",
  sha: "しゃ",
  shu: "しゅ",
  sho: "しょ",

  // T series
  ta: "た",
  chi: "ち",
  tsu: "つ",
  te: "て",
  to: "と",
  cha: "ちゃ",
  chu: "ちゅ",
  cho: "ちょ",

  // N series
  na: "な",
  ni: "に",
  nu: "ぬ",
  ne: "ね",
  no: "の",
  nya: "にゃ",
  nyu: "にゅ",
  nyo: "にょ",

  // H series
  ha: "は",
  hi: "ひ",
  fu: "ふ",
  he: "へ",
  ho: "ほ",
  hya: "ひゃ",
  hyu: "ひゅ",
  hyo: "ひょ",

  // M series
  ma: "ま",
  mi: "み",
  mu: "む",
  me: "め",
  mo: "も",
  mya: "みゃ",
  myu: "みゅ",
  myo: "みょ",

  // Y series
  ya: "や",
  yu: "ゆ",
  yo: "よ",

  // R series
  ra: "ら",
  ri: "り",
  ru: "る",
  re: "れ",
  ro: "ろ",
  rya: "りゃ",
  ryu: "りゅ",
  ryo: "りょ",

  // W series
  wa: "わ",
  wo: "を",
  nn: "ん",

  // G series
  ga: "が",
  gi: "ぎ",
  gu: "ぐ",
  ge: "げ",
  go: "ご",
  gya: "ぎゃ",
  gyu: "ぎゅ",
  gyo: "ぎょ",

  // Z series
  za: "ざ",
  ji: "じ",
  zu: "ず",
  ze: "ぜ",
  zo: "ぞ",
  ja: "じゃ",
  ju: "じゅ",
  jo: "じょ",
  jya: "じゃ",
  jyu: "じゅ",
  jyo: "じょ",

  // D series
  da: "だ",
  di: "ぢ",
  du: "づ",
  de: "で",
  do: "ど",

  // B series
  ba: "ば",
  bi: "び",
  bu: "ぶ",
  be: "べ",
  bo: "ぼ",
  bya: "びゃ",
  byu: "びゅ",
  byo: "びょ",

  // P series
  pa: "ぱ",
  pi: "ぴ",
  pu: "ぷ",
  pe: "ぺ",
  po: "ぽ",
  pya: "ぴゃ",
  pyu: "ぴゅ",
  pyo: "ぴょ",
};

// Convert hiragana to katakana
const HIRAGANA_TO_KATAKANA: Record<string, string> = {
  あ: "ア",
  い: "イ",
  う: "ウ",
  え: "エ",
  お: "オ",
  か: "カ",
  き: "キ",
  く: "ク",
  け: "ケ",
  こ: "コ",
  が: "ガ",
  ぎ: "ギ",
  ぐ: "グ",
  げ: "ゲ",
  ご: "ゴ",
  さ: "サ",
  し: "シ",
  す: "ス",
  せ: "セ",
  そ: "ソ",
  ざ: "ザ",
  じ: "ジ",
  ず: "ズ",
  ぜ: "ゼ",
  ぞ: "ゾ",
  た: "タ",
  ち: "チ",
  つ: "ツ",
  て: "テ",
  と: "ト",
  だ: "ダ",
  ぢ: "ヂ",
  づ: "ヅ",
  で: "デ",
  ど: "ド",
  な: "ナ",
  に: "ニ",
  ぬ: "ヌ",
  ね: "ネ",
  の: "ノ",
  は: "ハ",
  ひ: "ヒ",
  ふ: "フ",
  へ: "ヘ",
  ほ: "ホ",
  ば: "バ",
  び: "ビ",
  ぶ: "ブ",
  べ: "ベ",
  ぼ: "ボ",
  ぱ: "パ",
  ぴ: "ピ",
  ぷ: "プ",
  ぺ: "ペ",
  ぽ: "ポ",
  ま: "マ",
  み: "ミ",
  む: "ム",
  め: "メ",
  も: "モ",
  や: "ヤ",
  ゆ: "ユ",
  よ: "ヨ",
  ら: "ラ",
  り: "リ",
  る: "ル",
  れ: "レ",
  ろ: "ロ",
  わ: "ワ",
  を: "ヲ",
  ん: "ン",
  きゃ: "キャ",
  きゅ: "キュ",
  きょ: "キョ",
  しゃ: "シャ",
  しゅ: "シュ",
  しょ: "ショ",
  ちゃ: "チャ",
  ちゅ: "チュ",
  ちょ: "チョ",
  にゃ: "ニャ",
  にゅ: "ニュ",
  にょ: "ニョ",
  ひゃ: "ヒャ",
  ひゅ: "ヒュ",
  ひょ: "ヒョ",
  みゃ: "ミャ",
  みゅ: "ミュ",
  みょ: "ミョ",
  りゃ: "リャ",
  りゅ: "リュ",
  りょ: "リョ",
  ぎゃ: "ギャ",
  ぎゅ: "ギュ",
  ぎょ: "ギョ",
  じゃ: "ジャ",
  じゅ: "ジュ",
  じょ: "ジョ",
  びゃ: "ビャ",
  びゅ: "ビュ",
  びょ: "ビョ",
  ぴゃ: "ピャ",
  ぴゅ: "ピュ",
  ぴょ: "ピョ",
};

/**
 * Convert romaji to hiragana
 */
export function romajiToHiragana(romaji: string): ConversionResult {
  const normalized = romaji.toLowerCase().trim();
  const errors: string[] = [];

  // Preprocess double consonants (tt, pp, kk, etc.) to small tsu
  let preprocessed = normalized;
  const doubleConsonants = [
    "tt",
    "pp",
    "kk",
    "ss",
    "mm",
    "rr",
    "gg",
    "dd",
    "bb",
    "jj",
    "zz",
    "ff",
    "hh",
    "yy",
    "ww",
    "vv",
    "ll",
    "cc",
    "xx",
  ];

  for (const consonant of doubleConsonants) {
    // Replace double consonants with small tsu + single consonant
    preprocessed = preprocessed.replace(
      new RegExp(consonant, "g"),
      "っ" + consonant[1],
    );
  }

  let converted = "";
  let i = 0;

  while (i < preprocessed.length) {
    let found = false;

    // Try longest matches first (up to 3 characters)
    for (let len = 3; len >= 1; len--) {
      const substr = preprocessed.substring(i, i + len);
      if (ROMAJI_TO_HIRAGANA[substr]) {
        converted += ROMAJI_TO_HIRAGANA[substr];
        i += len;
        found = true;
        break;
      }
    }

    if (!found) {
      // Handle special cases
      if (preprocessed[i] === " ") {
        converted += " ";
        i++;
      } else if (preprocessed[i] === "-") {
        // Long vowel marker
        converted += "ー";
        i++;
      } else {
        errors.push(`Unknown character: ${preprocessed[i]}`);
        converted += preprocessed[i];
        i++;
      }
    }
  }

  return {
    original: romaji,
    converted,
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Convert romaji to katakana
 */
export function romajiToKatakana(romaji: string): ConversionResult {
  // Handle special cases and long vowel marker for katakana
  const normalized = romaji
    .toLowerCase()
    .trim()
    // Handle ja/ju/jo variations first
    .replace(/j(y[auo])/g, "j$1") // Preserve jya/jyu/jyo
    .replace(/j([auo])/g, "j$1") // Handle ja/ju/jo
    // Then handle long vowels
    .replace(/([aiueo])\1/g, "$1-") // Convert double vowels to vowel + dash
    .replace(/u-/g, "ū") // Special case for juusu -> jūsu
    .replace(/(\w)-/g, "$1ー"); // Convert remaining dashes to long vowel marker

  const hiraganaResult = romajiToHiragana(normalized);

  let katakana = "";
  for (let i = 0; i < hiraganaResult.converted.length; i++) {
    const char = hiraganaResult.converted[i];
    katakana += HIRAGANA_TO_KATAKANA[char] || char;
  }

  return {
    original: romaji,
    converted: katakana,
    isValid: hiraganaResult.isValid,
    errors: hiraganaResult.errors,
  };
}

/**
 * Convert romaji to kana with options
 */
export function romajiToKana(
  romaji: string,
  options: ConversionOptions,
): ConversionResult {
  if (options.outputType === "katakana") {
    return romajiToKatakana(romaji);
  } else {
    return romajiToHiragana(romaji);
  }
}

/**
 * Check if text is romaji
 */
export function isRomaji(text: string): boolean {
  return /^[a-zA-Z0-9\s\-]*$/.test(text);
}

/**
 * Check if text is hiragana
 */
export function isHiragana(text: string): boolean {
  return /^[\u3040-\u309F\s]*$/.test(text);
}

/**
 * Check if text is katakana
 */
export function isKatakana(text: string): boolean {
  return /^[\u30A0-\u30FF\s]*$/.test(text);
}

/**
 * Detect script type of input text
 */
export function detectScript(
  text: string,
): "romaji" | "hiragana" | "katakana" | "kanji" | "mixed" {
  const trimmed = text.trim();
  if (!trimmed) return "romaji";

  const hasRomaji = /[a-zA-Z]/.test(trimmed);
  const hasHiragana = /[\u3040-\u309F]/.test(trimmed);
  const hasKatakana = /[\u30A0-\u30FF]/.test(trimmed);
  const hasKanji = /[\u4E00-\u9FAF]/.test(trimmed);

  const scriptCount = [hasRomaji, hasHiragana, hasKatakana, hasKanji].filter(
    Boolean,
  ).length;

  if (scriptCount > 1) return "mixed";
  if (hasRomaji) return "romaji";
  if (hasHiragana) return "hiragana";
  if (hasKatakana) return "katakana";
  if (hasKanji) return "kanji";

  return "romaji";
}

/**
 * Convert mixed input (romaji + other scripts) to target script
 */
export function convertMixedInput(
  input: string,
  targetScript: "hiragana" | "katakana",
): ConversionResult {
  const errors: string[] = [];
  let result = "";
  let i = 0;

  while (i < input.length) {
    if (/[a-zA-Z]/.test(input[i])) {
      // Find the end of the romaji sequence
      let j = i;
      while (j < input.length && /[a-zA-Z]/.test(input[j])) {
        j++;
      }

      const romajiPart = input.substring(i, j);
      const conversion =
        targetScript === "hiragana"
          ? romajiToHiragana(romajiPart)
          : romajiToKatakana(romajiPart);

      result += conversion.converted;
      if (!conversion.isValid && conversion.errors) {
        errors.push(...conversion.errors);
      }

      i = j;
    } else {
      result += input[i];
      i++;
    }
  }

  return {
    original: input,
    converted: result,
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Smart input conversion based on field type and settings
 */
export function convertInputForField(
  input: string,
  fieldType: "hiragana" | "katakana" | "romaji",
  settings?: { romaji_output_type?: "hiragana" | "katakana" },
): ConversionResult {
  const scriptType = detectScript(input);

  // Handle pure romaji input
  if (scriptType === "romaji") {
    if (fieldType === "hiragana") {
      return romajiToHiragana(input);
    } else if (fieldType === "katakana") {
      return romajiToKatakana(input);
    } else if (fieldType === "romaji") {
      // Convert based on settings
      const outputType = settings?.romaji_output_type || "hiragana";
      return outputType === "katakana"
        ? romajiToKatakana(input)
        : romajiToHiragana(input);
    }
  }

  // Handle mixed input
  if (scriptType === "mixed") {
    if (fieldType === "hiragana") {
      return convertMixedInput(input, "hiragana");
    } else if (fieldType === "katakana") {
      return convertMixedInput(input, "katakana");
    }
  }

  // No conversion needed
  return {
    original: input,
    converted: input,
    isValid: true,
  };
}
