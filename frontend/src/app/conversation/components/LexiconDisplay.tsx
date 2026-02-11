import { ConversationalToken } from "./types";
import { TokenPopover } from "./TokenPopover";

type Props = {
  text: string;
  lexicon?: ConversationalToken[];
  showMorphology: boolean;
};

export function LexiconDisplay({ text, lexicon, showMorphology }: Props) {
  if (!showMorphology || !lexicon || lexicon.length === 0) {
    return <span className="text-lg leading-relaxed">{text}</span>;
  }

  return (
    <div className="flex flex-wrap items-end gap-x-1 gap-y-2 text-lg leading-relaxed">
      {lexicon.map((token, index) => (
        <TokenPopover key={`${token.surface}-${index}`} token={token}>
          <span className="cursor-pointer border-b-2 border-transparent hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all rounded px-0.5">
            {token.surface}
          </span>
        </TokenPopover>
      ))}
    </div>
  );
}
