import { fetchFromBackend } from "@/lib/utils/api-utils";
import { AnnotateResponse } from "@/entities/lexicon";

export async function annotateText(text: string): Promise<AnnotateResponse> {
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
