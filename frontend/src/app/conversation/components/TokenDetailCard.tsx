import { ConversationalToken } from "./types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPosColor } from "../../tokenizer/components/TokenizerLegend";
import { cn } from "@/lib/utils/utils";
import { Edit, Plus, BookmarkPlus, X } from "lucide-react";
import Link from "next/link";

type Props = {
  token: ConversationalToken;
  onClose?: () => void;
};

export function TokenDetailCard({ token, onClose }: Props) {
  const colorClass = getPosColor(token.pos);
  const hasEnglish = token.english && token.english.trim().length > 0;

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 p-4 shadow-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur border border-border animate-in fade-in slide-in-from-bottom-4 duration-200 xl:top-24 xl:right-8 xl:left-auto xl:bottom-auto xl:w-80 xl:slide-in-from-right-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-2xl">{token.surface}</h3>
        <div className="flex items-center gap-2">
          <span className={cn("px-2 py-0.5 rounded text-xs font-semibold", colorClass)}>
            {token.pos}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground mb-4">
        Original Form: <span className="font-mono">{token.basic_form}</span>
      </div>

      <div className="space-y-3">
        <div className="border-t pt-3">
          <div className="font-medium text-purple-600 dark:text-purple-400 text-xl mb-1">
            {token.reading}
          </div>
          {hasEnglish ? (
            <div className="space-y-1">
              {token.english.split(",").map((m, i) => (
                <div key={i} className="text-sm text-foreground/90 flex gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>{m.trim()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-2">
              No translation available
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
        {hasEnglish ? (
          <>
            <Link href={`/vocabulary/edit/new?surface=${encodeURIComponent(token.surface)}&lemma=${encodeURIComponent(token.basic_form)}`} target="_blank">
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Edit className="w-4 h-4" />
                Create/Edit Word
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="w-full gap-2" disabled title="AI tokens don't have word IDs yet">
              <BookmarkPlus className="w-4 h-4" />
              Save to List
            </Button>
          </>
        ) : (
          <Link href={`/vocabulary/edit/new?surface=${encodeURIComponent(token.surface)}&lemma=${encodeURIComponent(token.basic_form)}`} target="_blank">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Create New Word
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}
