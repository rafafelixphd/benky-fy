
import React from 'react';
import { Word } from "@/entities/word";

interface KanaDisplayProps {
    word: Word;
}

export const KanaDisplay: React.FC<KanaDisplayProps> = ({ word }) => {
    return (
        <span>{word.reading.kana || "?"}</span>
    );
};
