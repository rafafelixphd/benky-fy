"use client";

import { useMemo, useState } from "react";
import { SystemToken } from "./types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Edit } from "lucide-react";
import { getPosColor } from "../../tokenizer/components/TokenizerLegend";
import { cn } from "@/lib/utils/utils";

type Props = {
  tokens: SystemToken[];
};

export function ConversationTokensSidebar({ tokens }: Props) {
  const [expandedToken, setExpandedToken] = useState<string | null>(null);

  // Extract unique tokens by surface form
  const uniqueTokens = useMemo(() => {
    const map = new Map<string, SystemToken>();
    (tokens || []).forEach((t) => {
      if (t.label === "PARTICLE" || t.label === "PUNC" || t.label === "PUNCT") return;
      if (!map.has(t.surface)) {
        map.set(t.surface, t);
      }
    });
    return Array.from(map.values());
  }, [tokens]);

  const toggleExpand = (id: string) => {
    setExpandedToken(expandedToken === id ? null : id);
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
          Vocabulary
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {uniqueTokens.length}
          </span>
        </h2>
      </div>

      <div className="p-2 space-y-2">
        {uniqueTokens.map((token) => {
          const isExpanded = expandedToken === `tok-${token.token_id}`;
          const colorClass = getPosColor(token.label);
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
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>

              {/* Expanded Content - Using TokenDetailCard styling */}
              {isExpanded && (
                <div className="p-4 border-t border-border/50 bg-muted/10">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <span className={cn("px-2 py-0.5 rounded text-xs font-semibold", colorClass)}>
                      {token.pos}
                    </span>
                    <span>•</span>
                    <span className="font-mono">Original: {token.lemma}</span>
                  </div>

                  {vocab.known && vocab.candidates.length > 0 ? (
                    <div className="space-y-3">
                      {vocab.candidates.slice(0, 3).map((word) => (
                        <div
                          key={word.id}
                          className="border-t pt-3 first:border-t-0 first:pt-0"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="font-bold text-2xl text-foreground flex items-center gap-2 mb-1">
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
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 text-center">
                      <p className="text-sm mb-3 text-muted-foreground">
                        No dictionary match found.
                      </p>
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
