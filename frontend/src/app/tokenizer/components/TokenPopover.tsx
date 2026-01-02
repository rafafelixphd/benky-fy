import { useState, useRef } from "react";
import { Token, Vocab } from "@/entities/lexicon";
import { Word } from "@/entities/word";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

type Props = {
  token: Token;
  onReplace: (original: string, word: Word) => void;
  children: React.ReactNode;
};

export function TokenPopover({ token, onReplace, children }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const vocab = token.vocab;
  const closeTimer = useRef<NodeJS.Timeout | null>(null);

  const handleCreateWord = () => {
    const params = new URLSearchParams();
    params.set("surface", token.surface);
    params.set("lemma", token.lemma);
    router.push(`/vocabulary/edit/new?${params.toString()}`);
  };

  const handleMouseEnter = () => {
    if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => {
        setIsOpen(false);
    }, 300); 
  };

  return (
    <div 
        className="relative inline-block group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
    >
      <div
        className="cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {children}
      </div>

      {isOpen && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64">
           <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
           
          <Card className="relative z-50 p-4 shadow-xl bg-white dark:bg-zinc-900 border border-border">
            <h3 className="font-bold text-lg mb-1">{token.surface}</h3>
            <div className="text-xs text-muted-foreground mb-3">
              {token.pos} • {token.lemma}
            </div>

            {vocab.known && vocab.candidates.length > 0 ? (
              <div className="space-y-3">
                {vocab.candidates.slice(0, 3).map((word) => (
                  <div key={word.id} className="border-t pt-2 first:border-t-0 first:pt-0">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                         <div className="font-medium text-purple-600 dark:text-purple-400">
                           {word.reading.kana}
                         </div>
                         <div className="text-sm">
                           {word.reading.english.join(", ")}
                         </div>
                      </div>
                    </div>
                    <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full text-xs h-7"
                        onClick={() => {
                            onReplace(token.surface, word);
                            setIsOpen(false);
                        }}
                    >
                        Replace Text
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-sm mb-3 text-muted-foreground">
                  No direct dictionary match found.
                </p>
                <Button 
                    size="sm" 
                    className="w-full"
                    onClick={handleCreateWord}
                >
                    Create Word
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
