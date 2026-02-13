
import React from 'react';
import { Word } from "@/entities/word";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";

interface FuriganaDisplayProps {
    word: Word;
}

export const FuriganaDisplay: React.FC<FuriganaDisplayProps> = ({ word }) => {
    const { kanji_split, kanji_split_type, kana_split } = word.reading;
    const kanjiText = word.reading.kanji;
    
    // If we have split data, use it to display furigana
    if (kanjiText && kanji_split && kanji_split_type && kana_split &&
        kanji_split.length === kanji_split_type.length &&
        kanji_split.length === kana_split.length) {

        return (
            <span className="flex items-end justify-center flex-wrap gap-0.5">
                {kanji_split.map((char, index) => {
                    const type = kanji_split_type[index];
                    const reading = kana_split[index];

                    if (type === 'kanji') {
                        return (
                            <div key={index} className="flex flex-col items-center">
                                <span className="text-sm text-orange-300 mb-[-5px] select-none">{reading}</span>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="cursor-help hover:text-indigo-300 transition-colors border-b-2 border-transparent hover:border-indigo-300 border-dotted">
                                            {char}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-indigo-900 border-indigo-500/50 text-white font-bold text-lg">
                                        {reading}
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        );
                    }
                    // For non-kanji parts, we might want to align them properly with the kanji
                    // Use a transparent reading to keep baseline alignment if needed, or just center.
                    // Usually furigana is only above kanji.
                    return (
                        <div key={index} className="flex flex-col items-center justify-end">
                            <span className="text-sm text-transparent mb-[-5px] select-none">.</span>
                            <span>{char}</span>
                        </div>
                    );
                })}
            </span>
        );
    }

    // Fallback if no split data (should be rare for words with Kanji)
    // If only Kana, just show Kana
    if (!kanjiText) {
        return <span>{word.reading.kana || "?"}</span>;
    }

    // If Kanji but no split, show Kanji (maybe with Kana in parens? or just Kanji)
    // The requirement says "On the top of the kanji character (if existent), we show the kana version of the character with a light orange colour."
    // Without split data we can't do character-by-character furigana.
    // We could show the whole reading above the whole word.
    
    return (
        <div className="flex flex-col items-center">
            <span className="text-lg text-orange-300 mb-[-5px]">{word.reading.kana}</span>
             <span>{kanjiText}</span>
        </div>
    );
};
