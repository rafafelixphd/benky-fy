import { ConversationalToken } from "./types";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/utils";

type Props = {
  token: ConversationalToken;
  children: React.ReactNode;
  onSelect: (token: ConversationalToken | null) => void;
  onClick: (token: ConversationalToken) => void;
  className?: string;
};

export function InteractiveToken({ token, children, onSelect, onClick, className }: Props) {
  return (
    <span
      className={cn(
        "cursor-pointer border-b border-transparent hover:border-primary/50 transition-colors inline-block group relative",
        className
      )}
      onMouseEnter={() => onSelect(token)}
      onMouseLeave={() => onSelect(null)}
      onClick={(e) => {
        e.stopPropagation();
        onClick(token);
      }}
    >
      {children}
    </span>
  );
}
