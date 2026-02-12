import { fetchFromBackend } from "@/lib/utils/api-utils";
import { ConversationalResponse, SystemToken } from "./components/types";

export async function fetchConversation(text: string): Promise<ConversationalResponse> {
  return fetchFromBackend("/v2/conversation/chat", {
    method: "POST",
    body: JSON.stringify({ user_input: text }),
  });
}

export async function fetchSystemTokenization(text: string): Promise<{ tokens: SystemToken[] }> {
  return fetchFromBackend("/v2/lexicon/annotate", {
    method: "POST",
    body: JSON.stringify({
      text,
      options: {
        include_dep: true,
        include_morph: true,
      },
    }),
  });
}
