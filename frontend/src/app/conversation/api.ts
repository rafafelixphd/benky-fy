import { fetchFromBackend } from "@/lib/utils/api-utils";
import { ConversationalResponse } from "./components/types";

export async function fetchConversation(text: string): Promise<ConversationalResponse> {
  return fetchFromBackend("/v2/conversation/chat", {
    method: "POST",
    body: JSON.stringify({ user_input: text }),
  });
}
