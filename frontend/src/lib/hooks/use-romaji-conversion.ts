import { useMemo } from 'react';
import { convertInputForField } from '@/lib/utils/romaji-conversion';

export type KanaType = 'hiragana' | 'katakana' | 'romaji';

export function useRomajiConversion(input: string, type: KanaType = 'hiragana') {
    return useMemo(() => {
        if (!input) {
            return { converted: '', original: '', isValid: true };
        }
        const result = convertInputForField(input, type);
        return result;
    }, [input, type]);
}
