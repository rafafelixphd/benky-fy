
import React from 'react';
import { Word } from "@/entities/word";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";

interface KanjiDisplayProps {
    word: Word;
}

export const KanjiDisplay: React.FC<KanjiDisplayProps> = ({ word }) => {
    const { kanji_split, kanji_split_type, kana_split } = word.reading;
    const kanjiText = word.reading.kanji;

    if (kanjiText && kanji_split && kanji_split_type && kana_split &&
        kanji_split.length === kanji_split_type.length &&
        kanji_split.length === kana_split.length) {

        return (
            <span className="flex items-center justify-center flex-wrap gap-0.5">
                {kanji_split.map((char, index) => {
                    const type = kanji_split_type[index];
                    const reading = kana_split[index];

                    if (type === 'kanji') {
                        return (
                            <Tooltip key={index}>
                                <TooltipTrigger asChild>
                                    <span className="cursor-help hover:text-indigo-300 transition-colors border-b-2 border-transparent hover:border-indigo-300 border-dotted">
                                        {char}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent className="bg-indigo-900 border-indigo-500/50 text-white font-bold text-lg">
                                    {reading}
                                </TooltipContent>
                            </Tooltip>
                        );
                    }
                    return <span key={index}>{char}</span>;
                })}
            </span>
        );
    }

    return <span>{kanjiText ? kanjiText : (word.reading.kana || "?")}</span>;
};
