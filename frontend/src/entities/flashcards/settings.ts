export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'EXPERT';

export type Level = {
    jlpt: JLPTLevel | null;
    custom: number;
};

export type PartOfSpeech =
    | 'noun'
    | 'verb'
    | 'adjectives'
    | 'particles'
    | 'sentence-end'
    | 'functional'
    | 'context'
    | 'expressions';

export type ContentTag =
    | 'travel'
    | 'business'
    | 'food'
    | 'dining'
    | 'anime'
    | 'media'
    | 'everyday'
    | 'small-talk';

export type CardDisplayMode = 'english' | 'kana' | 'kanji';

export type InputMode = 'english' | 'romaji' | 'kanji' | 'kana';

export interface DisplaySettings {
    cardDisplay: CardDisplayMode;
    inputMode: 'view-only' | InputMode[];
}

export interface FlashcardSettings {
    /** Files from which levels to draw words */
    level?: Level;

    /** Selected parts of speech */
    partOfSpeech?: PartOfSpeech[];

    /** Content domains/tags */
    tag?: ContentTag[];

    maxCards: number;

    /** Session Mode: 'random' or 'anki' or 'custom-list' */
    mode?: 'random' | 'anki' | 'custom-list';

    /** List ID for custom-list mode */
    listId?: number;

    /** Ratio of new words (0.0 to 1.0) for Anki mode */
    learningRatio?: number;

    /** Display configuration for the flashcards */
    display: DisplaySettings;
}

export const DEFAULT_FLASHCARD_SETTINGS: FlashcardSettings = {
    level: {jlpt: "N5", custom: null},
    mode: "anki",
    learningRatio: 0.3,
    partOfSpeech: [],
    tag: [],
    maxCards: 10,
    display: {
        cardDisplay: 'kanji',
        inputMode: ['english', 'kana'],
    },
};

export const PARTS_OF_SPEECH: { value: PartOfSpeech; label: string }[] = [
    { value: 'noun', label: 'Noun' },
    { value: 'verb', label: 'Verb' },
    { value: 'adjectives', label: 'Adjectives' },
    { value: 'particles', label: 'Particles' },
    { value: 'sentence-end', label: 'Sentence End' },
    { value: 'functional', label: 'Functional' },
    { value: 'context', label: 'Context' },
    { value: 'expressions', label: 'Expressions' },
];

export const JLPT_LEVELS: { value: JLPTLevel; label: string; color: string }[] = [
    { value: 'N5', label: 'N5', color: 'bg-green-100 text-green-700' },
    { value: 'N4', label: 'N4', color: 'bg-teal-100 text-teal-700' },
    { value: 'N3', label: 'N3', color: 'bg-blue-100 text-blue-700' },
    { value: 'N2', label: 'N2', color: 'bg-indigo-100 text-indigo-700' },
    { value: 'N1', label: 'N1', color: 'bg-purple-100 text-purple-700' },
    { value: 'EXPERT', label: 'Expert', color: 'bg-red-100 text-red-700' },
];

export const CONTENT_TAGS: { value: ContentTag; label: string; icon: string }[] = [
    { value: 'everyday', label: 'Everyday Life', icon: '🏠' },
    { value: 'travel', label: 'Travel', icon: '✈️' },
    { value: 'business', label: 'Business', icon: '💼' },
    { value: 'food', label: 'Food & Dining', icon: '🍱' },
    { value: 'dining', label: 'Dining Out', icon: '🍽️' },
    { value: 'anime', label: 'Anime/Manga', icon: '📺' },
    { value: 'media', label: 'Media/News', icon: '📰' },
    { value: 'small-talk', label: 'Small Talk', icon: '💬' },
];