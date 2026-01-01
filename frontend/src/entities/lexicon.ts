export type Vocab = {
  known: boolean;
  word_id: number | null;
  candidate_ids: number[];
  candidate_scores: number[];
};

export type Token = {
  token_id: number;
  surface: string;
  start: number;
  end: number;
  pos: string;
  lemma: string;
  label: string;
  morph?: string;
  dep?: string;
  lexeme_id?: number;
  vocab: Vocab;
};

export type Lexeme = {
  lexeme_id: number;
  surface: string;
  start: number;
  end: number;
  pos: string;
  lemma: string;
  token_ids: number[];
  vocab: Vocab;
};

export type AnnotateResponse = {
  text: string;
  tokens: Token[];
  lexemes: Lexeme[];
};
