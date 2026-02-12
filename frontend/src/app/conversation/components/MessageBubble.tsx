import { ConversationalMessagePart, ConversationalToken, TokenizationMode, SystemToken } from "./types";
import { LexiconDisplay } from "./LexiconDisplay";
import { SystemTokenDisplay } from "./SystemTokenDisplay";
import { cn } from "@/lib/utils/utils";
import { Bot, User } from "lucide-react";

type Props = {
  part: ConversationalMessagePart;
  isUser: boolean;
  showEnglish: boolean;
  showJapanese: boolean;
  tokenizationMode: TokenizationMode;
  systemTokens?: SystemToken[];
  displayMode: "surface" | "reading";
  onSelectToken: (token: ConversationalToken | null) => void;
  onSelectSystemToken: (token: SystemToken | null) => void;
};

export function MessageBubble({
  part,
  isUser,
  showEnglish,
  showJapanese,
  tokenizationMode,
  systemTokens,
  displayMode,
  onSelectToken,
  onSelectSystemToken,
}: Props) {
  const showAiMorphology = tokenizationMode === "ai";
  const showSystemMorphology = tokenizationMode === "system";

  return (
    <div
      className={cn(
        "flex w-full mt-4 space-x-3 max-w-3xl",
        isUser ? "ml-auto justify-end" : ""
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
        </div>
      )}

      <div
        className={cn(
          "relative px-4 py-3 rounded-2xl shadow-sm text-sm border",
          isUser
            ? "bg-secondary text-secondary-foreground border-secondary-foreground/10 rounded-tr-none"
            : "bg-background border-border rounded-tl-none"
        )}
      >
        <div className="flex flex-col gap-2">
            {showJapanese && (
                <div className="font-medium text-foreground">
                    {showAiMorphology ? (
                      <LexiconDisplay 
                          text={part.japanese} 
                          lexicon={part.lexicon} 
                          showMorphology={showAiMorphology}
                          displayMode={displayMode}
                          onSelect={onSelectToken}
                      />
                    ) : showSystemMorphology && systemTokens ? (
                      <SystemTokenDisplay
                          text={part.japanese}
                          tokens={systemTokens}
                          displayMode={displayMode}
                          onSelectToken={onSelectSystemToken}
                      />
                    ) : (
                      <span className="text-lg leading-relaxed">{part.japanese}</span>
                    )}
                </div>
            )}
            
            {showEnglish && showJapanese && (
                <div className={cn("h-px w-full my-1 opacity-20", isUser ? "bg-white" : "bg-border")} />
            )}

            {showEnglish && (
                <div className={cn("text-sm opacity-90", isUser ? "text-white/90" : "text-muted-foreground", !showJapanese && "text-base")}>
                    {part.english}
                </div>
            )}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <User size={18} />
          </div>
        </div>
      )}
    </div>
  );
}
