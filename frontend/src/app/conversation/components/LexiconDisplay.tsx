import { ConversationalToken } from "./types";
import { InteractiveToken } from "./TokenPopover";
import { getPosColor } from "../../tokenizer/components/TokenizerLegend";
import { cn } from "@/lib/utils/utils";

type Props = {
  text: string;
  lexicon?: ConversationalToken[];
  showMorphology: boolean;
  displayMode: "surface" | "reading";
  onSelect: (token: ConversationalToken | null) => void;
  onClick: (token: ConversationalToken) => void;
};

export function LexiconDisplay({ text, lexicon, showMorphology, displayMode, onSelect, onClick }: Props) {
  if (!showMorphology || !lexicon || lexicon.length === 0) {
    return <span className="text-lg leading-relaxed">{text}</span>;
  }

  return (
    <div className="flex flex-wrap items-end gap-x-1 gap-y-2 text-lg leading-relaxed font-sans">
      {lexicon.map((token, index) => {
        const colorClass = getPosColor(token.pos);
        const content = displayMode === "reading" ? token.reading : token.surface;
        
        return (
          <InteractiveToken 
            key={`${token.surface}-${index}`} 
            token={token} 
            onSelect={onSelect} 
            onClick={onClick}
            className={cn(
              "rounded-sm px-[2px] mx-[-1px] border-b-2 transition-all hover:opacity-80",
              colorClass
            )}
          >
            {content}
          </InteractiveToken>
        );
      })}
    </div>
  );
}
