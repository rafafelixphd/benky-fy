export type ConversationalToken = {
  surface: string;
  reading: string;
  pos: string;
  basic_form: string;
  english: string;
};

export type ConversationalMessagePart = {
  english: string;
  japanese: string;
  lexicon?: ConversationalToken[];
};

export type ConversationalResponse = {
  user_input: ConversationalMessagePart;
  agent_response: ConversationalMessagePart;
};

// System tokenization types (from /v2/lexicon/annotate)
export type TokenizationMode = "none" | "ai" | "system";

export type SystemVocab = {
  known: boolean;
  word_id: number | null;
  candidates: Array<{
    id: number;
    surface: string;
    reading: {
      kana: string;
      kanji: string;
      english: string[];
    };
    part_of_speech: string[];
    level: any;
    category: string[];
  }>;
};

export type SystemToken = {
  token_id: number;
  surface: string;
  start: number;
  end: number;
  pos: string;
  lemma: string;
  label: string;
  morph: string;
  dep: string;
  lexeme_id: number;
  vocab: SystemVocab;
};
