"use client";

import { useMemo, useState } from "react";
import { Token, Vocab } from "@/entities/lexicon";
import { Word } from "@/entities/word";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { POS_COLORS } from "./TokenizerLegend";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Plus, RefreshCw, Edit } from "lucide-react"; // Assuming lucide-react is available as it's standard in shadcn/ui

type Props = {
  tokens: Token[];
  onReplace: (target: string, word: Word) => void;
};

export function TokenizerUniqueWords({ tokens, onReplace }: Props) {
  const router = useRouter();
  const [expandedStart, setExpandedStart] = useState<string | null>(null);

  // Extract unique tokens by surface form
  const uniqueTokens = useMemo(() => {
    const map = new Map<string, Token>();
    (tokens || []).forEach((t) => {
        if (t.label === "PARTICLE" || t.label === "PUNC" || t.label === "PUNCT") return;
        if (!map.has(t.surface)) {
            map.set(t.surface, t);
        }
    });
    return Array.from(map.values());
  }, [tokens]);

  const handleCreateWord = (token: Token) => {
    const params = new URLSearchParams();
    params.set("surface", token.surface);
    params.set("lemma", token.lemma);
    window.open(`/vocabulary/edit/new?${params.toString()}`);
  };

  const toggleExpand = (id: string) => {
    setExpandedStart(expandedStart === id ? null : id);
  };

  if (uniqueTokens.length === 0) {
      return (
          <Card className="p-4 bg-background/50 backdrop-blur-sm border-white/10">
              <p className="text-sm text-muted-foreground text-center">
                  Words will appear here...
              </p>
          </Card>
      );
  }

  return (
    <Card className="h-fit max-h-[calc(100vh-200px)] overflow-y-auto bg-background/95 backdrop-blur-sm border-white/20 shadow-xl flex flex-col">
      <div className="p-4 border-b border-border bg-muted/20 sticky top-0 z-10 backdrop-blur-md">
        <h2 className="font-bold text-lg flex items-center gap-2">
            Unique Words
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {uniqueTokens.length}
            </span>
        </h2>
      </div>

      <div className="p-2 space-y-2">
        {uniqueTokens.map((token) => {
           const isExpanded = expandedStart === `tok-${token.token_id}`;
           const colorClass = POS_COLORS[token.label] || "bg-gray-100 dark:bg-zinc-800";
           const vocab = token.vocab;

           return (
             <div 
                key={`unique-${token.token_id}`}
                className="border border-border rounded-md overflow-hidden bg-white dark:bg-zinc-900 transition-all"
             >
                {/* Header */}
                <div 
                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleExpand(`tok-${token.token_id}`)}
                >
                    <div className="flex items-center gap-3">
                         <span className={`w-3 h-3 rounded-full ${colorClass}`} />
                         <span className="font-bold text-lg">{token.surface}</span>
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                    <div className="p-3 pt-0 border-t border-border/50 bg-muted/10">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 mt-2">
                            <span className="bg-muted px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold">
                                {token.pos}
                            </span>
                            <span>•</span>
                            <span className="font-mono">{token.lemma}</span>
                        </div>

                        {vocab.known && vocab.candidates.length > 0 ? (
                            <div className="space-y-3">
                                {vocab.candidates.slice(0, 3).map((word) => (
                                    <div key={word.id} className="bg-background/50 rounded p-2 border border-border/50">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-bold text-lg text-foreground flex items-center gap-2">
                                                    {word.reading.kanji}
                                                    <Button 
                                                        size="icon" 
                                                        variant="ghost" 
                                                        className="h-6 w-6 text-muted-foreground hover:text-primary"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            window.open(`/vocabulary/edit/${word.id}`, "_blank");
                                                        }}
                                                        title="Edit Word"
                                                    >
                                                        <Edit className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                                <div className="font-medium text-purple-600 dark:text-purple-400">
                                                    {word.reading.kana}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                                    {word.reading.english.join(", ")}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="w-full text-xs h-7 gap-1"
                                                onClick={() => onReplace(token.surface, word)}
                                            >
                                                <RefreshCw className="w-3 h-3" /> Replace
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-2 text-center">
                                <p className="text-xs mb-3 text-muted-foreground">
                                    No dictionary match.
                                </p>
                                <Button 
                                    size="sm" 
                                    className="w-full gap-1"
                                    onClick={() => handleCreateWord(token)}
                                >
                                    <Plus className="w-3 h-3" /> Create Word
                                </Button>
                            </div>
                        )}
                    </div>
                )}
             </div>
           );
        })}
      </div>
    </Card>
  );
}
