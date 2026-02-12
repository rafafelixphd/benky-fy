import { SystemToken } from "./types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPosColor } from "../../tokenizer/components/TokenizerLegend";
import { cn } from "@/lib/utils/utils";
import { Edit, Plus, BookmarkPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SaveToListDialog } from "./SaveToListDialog";

type Props = {
  token: SystemToken;
};

export function SystemTokenDetailCard({ token }: Props) {
  const colorClass = getPosColor(token.label);
  const vocab = token.vocab;
  const hasWord = vocab.known && vocab.candidates.length > 0;
  const firstCandidate = hasWord ? vocab.candidates[0] : null;
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 p-4 shadow-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur border border-border animate-in fade-in slide-in-from-bottom-4 duration-200 xl:top-24 xl:right-8 xl:left-auto xl:bottom-auto xl:w-80 xl:slide-in-from-right-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-2xl">{token.surface}</h3>
        <span className={cn("px-2 py-0.5 rounded text-xs font-semibold", colorClass)}>
          {token.pos}
        </span>
      </div>
      
      <div className="text-sm text-muted-foreground mb-4">
        Original Form: <span className="font-mono">{token.lemma}</span>
      </div>

      <div className="space-y-3">
        {hasWord ? (
          vocab.candidates.slice(0, 3).map((word, idx) => (
            <div key={word.id} className="border-t pt-3 first:border-t-0 first:pt-0">
              <div className="font-medium text-purple-600 dark:text-purple-400 text-xl mb-1">
                {word.reading.kana}
              </div>
              <div className="space-y-1">
                {word.reading.english.map((meaning, i) => (
                  <div key={i} className="text-sm text-foreground/90 flex gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>{meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground text-center py-2">
            No dictionary match found
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
        {hasWord && firstCandidate ? (
          <>
            <Link href={`/vocabulary/edit/${firstCandidate.id}`} target="_blank">
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Edit className="w-4 h-4" />
                Edit Word
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => setShowSaveDialog(true)}
            >
              <BookmarkPlus className="w-4 h-4" />
              Save to List
            </Button>
          </>
        ) : (
          <Link href={`/vocabulary/annotate?text=${encodeURIComponent(token.surface)}`} target="_blank">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Create New Word
            </Button>
          </Link>
        )}
      </div>

      {/* Save to List Dialog */}
      {hasWord && firstCandidate && (
        <SaveToListDialog
          open={showSaveDialog}
          onOpenChange={setShowSaveDialog}
          wordId={firstCandidate.id}
          wordSurface={token.surface}
        />
      )}
    </Card>
  );
}
