import { Word } from "./word";

export interface WordList {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  entry_count?: number;
  created_at: string;
  updated_at: string;
  words?: Word[]; 
}

export interface WordListEntry {
  word_id: number;
  word_list_id: number;
  word?: Word;
  created_at: string;
}

export interface CreateWordListDto {
  name: string;
  description?: string;
}

export interface UpdateWordListDto {
  name?: string;
  description?: string;
}
