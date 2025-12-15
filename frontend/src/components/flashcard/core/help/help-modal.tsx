'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, HelpCircle, Loader2 } from "lucide-react";

interface HelpModalProps {
  moduleName: string;
  currentItemId: number;
  onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
  const [searchWord, setSearchWord] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchWord.trim()) {
      setIsSearching(true);
      // Simulate search delay
      setTimeout(() => {
        setIsSearching(false);
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto border border-border">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Help & Word Information</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Word Search */}
          <div>
            <h3 className="font-medium mb-4">Search Word Information</h3>
            <form onSubmit={handleSearch} className="space-y-3">
              <input
                type="text"
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                placeholder="Enter a Japanese word..."
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button type="submit" className="w-full">
                Search
              </Button>
            </form>
          </div>

          {/* Word Information Display */}
          {isSearching ? (
            <div className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Searching...</p>
            </div>
          ) : null}

          {/* Help Content */}
          <div>
            <h3 className="font-medium mb-4">How to Use Flashcards</h3>
            <div className="text-sm space-y-3 text-muted-foreground">
              <div>
                <strong>Answering:</strong> Type your answer in the input field
                and press Enter or click Submit.
              </div>
              <div>
                <strong>Navigation:</strong> Use the Previous/Next buttons or
                arrow keys to navigate between cards.
              </div>
              <div>
                <strong>Skip:</strong> Use the Skip button or Space key to skip
                difficult cards.
              </div>
              <div>
                <strong>Settings:</strong> Adjust display options like furigana
                and romaji in the settings panel.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
