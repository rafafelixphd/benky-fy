import { ConversationalToken, SystemToken } from "./types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPosColor } from "../../tokenizer/components/TokenizerLegend";
import { cn } from "@/lib/utils/utils";
import { Edit, Plus, BookmarkPlus, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SaveToListDialog } from "./SaveToListDialog";

type Props = {
  systemToken?: SystemToken;
  aiToken?: ConversationalToken;
  onClose?: () => void;
};

export function TokenDetailCard({ systemToken, aiToken, onClose }: Props) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Determine which data source to use for display
  const surface = systemToken?.surface || aiToken?.surface || "";
  const pos = systemToken?.pos || aiToken?.pos || "";
  const lemma = systemToken?.lemma || aiToken?.basic_form || "";
  const reading = aiToken?.reading || "";
  
  const colorClass = getPosColor(pos);
  
  // Check if we have system vocabulary data
  const hasSystemVocab = systemToken?.vocab?.known && systemToken.vocab.candidates.length > 0;
  const firstCandidate = hasSystemVocab ? systemToken.vocab.candidates[0] : null;
  
  // Check if we have AI-provided English data
  const hasAiEnglish = aiToken?.english && aiToken.english.trim().length > 0;

  const handleCreateWord = () => {
    const params = new URLSearchParams();
    params.set("surface", surface);
    params.set("lemma", lemma);
    
    // Use AI data if available for new word creation
    if (aiToken) {
      if (aiToken.reading) params.set("kana", aiToken.reading);
      if (hasAiEnglish) params.set("english", aiToken.english);
    }
    
    window.open(`/vocabulary/edit/new?${params.toString()}`);
  };

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 p-4 shadow-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur border border-border animate-in fade-in slide-in-from-bottom-4 duration-200 xl:top-24 xl:right-8 xl:left-auto xl:bottom-auto xl:w-80 xl:slide-in-from-right-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-2xl">{surface}</h3>
        <div className="flex items-center gap-2">
          <span className={cn("px-2 py-0.5 rounded text-xs font-semibold", colorClass)}>
            {pos}
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
        Original Form: <span className="font-mono">{lemma}</span>
      </div>

      <div className="space-y-3">
        {/* Prefer system vocab data if available */}
        {hasSystemVocab ? (
          systemToken.vocab.candidates.slice(0, 3).map((word, idx) => (
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
        ) : hasAiEnglish ? (
          // Fall back to AI data if no system vocab
          <div className="border-t pt-3">
            {reading && (
              <div className="font-medium text-purple-600 dark:text-purple-400 text-xl mb-1">
                {reading}
              </div>
            )}
            <div className="space-y-1">
              {aiToken.english.split(",").map((m, i) => (
                <div key={i} className="text-sm text-foreground/90 flex gap-2">
                  <span className="text-muted-foreground">{i + 1}.</span>
                  <span>{m.trim()}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground italic mt-2">
              AI-provided translation
            </p>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-2">
            No dictionary match or translation found
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
        {hasSystemVocab && firstCandidate ? (
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
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full gap-2"
            onClick={handleCreateWord}
          >
            <Plus className="w-4 h-4" />
            {hasAiEnglish ? "Create Word (AI Data Included)" : "Create New Word"}
          </Button>
        )}
      </div>

      {/* Save to List Dialog */}
      {hasSystemVocab && firstCandidate && (
        <SaveToListDialog
          open={showSaveDialog}
          onOpenChange={setShowSaveDialog}
          wordId={firstCandidate.id}
          wordSurface={surface}
        />
      )}
    </Card>
  );
}
