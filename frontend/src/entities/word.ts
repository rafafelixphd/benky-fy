export interface WordReading {
    kanji: string[];
    furigana: (string | boolean)[];
    kana: string[];
    romaji: string[];
    katakana: string[];
    english: string[];
}

export interface WordLevel {
    jlpt?: string;
    wanikani?: number;
    custom?: string;
}

export interface Word {
    id: number;
    reading: WordReading;
    level: WordLevel;
    part_of_speech: string[];
    category: string[];
    created_at?: string;
    updated_at?: string;
}

export interface FlashcardSettings {
    jlpt?: string;
    categories?: string[];
}
