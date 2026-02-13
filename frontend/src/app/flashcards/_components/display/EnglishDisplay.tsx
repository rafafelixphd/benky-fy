
import React from 'react';
import { Word } from "@/entities/word";

interface EnglishDisplayProps {
    word: Word;
}

export const EnglishDisplay: React.FC<EnglishDisplayProps> = ({ word }) => {
    return (
        <span>{word.reading.english?.join(", ") || "?"}</span>
    );
};
