import { ConversationalToken } from "./types";
import { Card } from "@/components/ui/card";
import { getPosColor } from "../../tokenizer/components/TokenizerLegend";
import { cn } from "@/lib/utils/utils";

type Props = {
  token: ConversationalToken;
};

export function TokenDetailCard({ token }: Props) {
  const colorClass = getPosColor(token.pos);

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 p-4 shadow-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur border border-border animate-in fade-in slide-in-from-bottom-4 duration-200 xl:top-24 xl:right-8 xl:left-auto xl:bottom-auto xl:w-80 xl:slide-in-from-right-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-2xl">{token.surface}</h3>
        <span className={cn("px-2 py-0.5 rounded text-xs font-semibold", colorClass)}>
          {token.pos}
        </span>
      </div>
      
      <div className="text-sm text-muted-foreground mb-4">
        Original Form: <span className="font-mono">{token.basic_form}</span>
      </div>

      <div className="space-y-3">
        <div className="border-t pt-3">
          <div className="font-medium text-purple-600 dark:text-purple-400 text-xl mb-1">
            {token.reading}
          </div>
          <div className="space-y-1">
            {token.english.split(",").map((m, i) => (
              <div key={i} className="text-sm text-foreground/90 flex gap-2">
                <span className="text-muted-foreground">•</span>
                <span>{m.trim()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
