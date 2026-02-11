import { useState, useRef } from "react";
import { ConversationalToken } from "./types";
import { Card } from "@/components/ui/card";

type Props = {
  token: ConversationalToken;
  children: React.ReactNode;
};

export function TokenPopover({ token, children }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimer = useRef<NodeJS.Timeout | null>(null);

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
        className="cursor-pointer border-b border-transparent hover:border-primary/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {children}
      </div>

      {isOpen && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64">
           {/* Invisible overlay for mobile click-away, though simple hover works best for desktop */}
           <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsOpen(false)} />
           
          <Card className="relative z-50 p-4 shadow-xl bg-white dark:bg-zinc-900 border border-border">
            <h3 className="font-bold text-lg mb-1">{token.surface}</h3>
            <div className="text-xs text-muted-foreground mb-3 flex gap-2">
              <span className="px-1.5 py-0.5 bg-secondary rounded-md">{token.pos}</span>
              <span>{token.basic_form}</span>
            </div>

            <div className="space-y-3">
                  <div className="border-t pt-2 first:border-t-0 first:pt-0">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                         <div className="font-medium text-purple-600 dark:text-purple-400 text-lg">
                           {token.reading}
                         </div>
                         <div className="text-sm mt-1">
                           {token.english.split(",").map((m, i) => (
                               <span key={i} className="block">• {m.trim()}</span>
                           ))}
                         </div>
                      </div>
                    </div>
                  </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
