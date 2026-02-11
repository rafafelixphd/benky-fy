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
