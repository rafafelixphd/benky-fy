import { SystemToken } from "./types";
import { getPosColor } from "../../tokenizer/components/TokenizerLegend";
import { cn } from "@/lib/utils/utils";

type Props = {
  text: string;
  tokens: SystemToken[];
  displayMode: "surface" | "reading";
  onSelectToken?: (token: SystemToken | null) => void;
  onClickToken?: (token: SystemToken) => void;
};

export function SystemTokenDisplay({ text, tokens, displayMode, onSelectToken, onClickToken }: Props) {
  if (!tokens || tokens.length === 0) {
    return <span className="text-lg leading-relaxed">{text}</span>;
  }

  // Sort tokens by start position to render them in order
  const sortedTokens = [...tokens].sort((a, b) => a.start - b.start);

  return (
    <div className="flex flex-wrap items-end gap-x-1 gap-y-2 text-lg leading-relaxed font-sans">
      {sortedTokens.map((token, index) => {
        const colorClass = getPosColor(token.label);
        const content = displayMode === "reading" ? token.lemma : token.surface;
        
        return (
          <span 
            key={`${token.token_id}-${index}`}
            className={cn(
              "cursor-pointer rounded-sm px-[2px] mx-[-1px] border-b-2 border-transparent transition-all hover:opacity-80 hover:border-primary/50",
              colorClass
            )}
            onMouseEnter={() => onSelectToken?.(token)}
            onMouseLeave={() => onSelectToken?.(null)}
            onClick={(e) => {
              e.stopPropagation();
              onClickToken?.(token);
            }}
          >
            {content}
          </span>
        );
      })}
    </div>
  );
}
