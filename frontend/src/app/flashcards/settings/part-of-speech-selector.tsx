'use client';

import { useState } from 'react';
import { SettingsSection } from './settings-section';
import { PartOfSpeech, PARTS_OF_SPEECH } from '@/entities/flashcards/settings';

export interface PartOfSpeechSelectorProps {
    selected: PartOfSpeech[];
    onChange: (selected: PartOfSpeech[]) => void;
}

export function PartOfSpeechSelector({
    selected,
    onChange,
}: PartOfSpeechSelectorProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleSelection = (value: PartOfSpeech) => {
        if (selected.includes(value)) {
            onChange(selected.filter((item) => item !== value));
        } else {
            onChange([...selected, value]);
        }
    };

    const toggleAll = () => {
        if (selected.length === PARTS_OF_SPEECH.length) {
            onChange([]);
        } else {
            onChange(PARTS_OF_SPEECH.map((item) => item.value));
        }
    };

    return (
        <SettingsSection
            title="Part of Speech"
            isExpanded={isExpanded}
            onToggle={() => setIsExpanded(!isExpanded)}
            indicatorColor="bg-purple-500"
        >
            <div className="space-y-4">
                <div className="flex justify-end">
                    <button
                        onClick={toggleAll}
                        className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                    >
                        {selected.length === PARTS_OF_SPEECH.length ? 'Deselect All' : 'Select All'}
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {PARTS_OF_SPEECH.map(({ value, label }) => (
                        <label key={value} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input
                                type="checkbox"
                                checked={selected.includes(value)}
                                onChange={() => toggleSelection(value)}
                                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                {label}
                            </span>
                        </label>
                    ))}
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-xs text-purple-700">
                        <span className="font-medium">💡 Tip:</span> Select which types of words you want to practice.
                    </p>
                </div>
            </div>
        </SettingsSection>
    );
}
