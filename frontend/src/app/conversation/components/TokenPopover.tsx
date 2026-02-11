import { ConversationalToken } from "./types";
import { Card } from "@/components/ui/card";

type Props = {
  token: ConversationalToken;
  children: React.ReactNode;
  onSelect: (token: ConversationalToken | null) => void;
};

export function InteractiveToken({ token, children, onSelect }: Props) {
  return (
    <span
      className="cursor-pointer border-b border-transparent hover:border-primary/50 transition-colors inline-block group relative"
      onMouseEnter={() => onSelect(token)}
      onMouseLeave={() => onSelect(null)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(token);
      }}
    >
      {children}
    </span>
  );
}
