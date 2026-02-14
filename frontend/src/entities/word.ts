export interface WordReading {
    kanji: string;
    kanji_split: string[];
    kanji_split_type?: string[];
    kana: string;
    kana_split: string[];
    english: string[];
    romaji?: string[];
    furigana?: (string | boolean)[];
    katakana?: string[];
}

export interface WordLevel {
    jlpt?: string;
    wanikani?: number;
    custom?: number | string;
}

export interface Word {
    id: number;
    reading: WordReading;
    level: WordLevel;
    part_of_speech: string[];
    category?: string[];
    
    examples?: WordExample[];
    
    created_at?: string;
    updated_at?: string;
}

export interface WordExample {
    id?: number;
    japanese: string;
    english: string;
    kana: string;
    reading: {
        surface: string;
        reading: string;
        type: string;
    }[];
    type?: string;
    source?: string;
}