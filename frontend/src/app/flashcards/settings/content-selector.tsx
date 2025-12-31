'use client';

import { useState } from 'react';
import { SettingsSection } from './settings-section';
import { ContentTag, JLPTLevel, JLPT_LEVELS, CONTENT_TAGS } from '@/entities/flashcards/settings';

export interface ContentSelectorProps {
    selectedLevels: JLPTLevel[];
    selectedTags: ContentTag[];
    onLevelsChange: (levels: JLPTLevel[]) => void;
    onTagsChange: (tags: ContentTag[]) => void;
}

export function ContentSelector({
    selectedLevels,
    selectedTags,
    onLevelsChange,
    onTagsChange,
}: ContentSelectorProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleLevel = (value: JLPTLevel) => {
        if (selectedLevels.includes(value)) {
            onLevelsChange(selectedLevels.filter((l) => l !== value));
        } else {
            onLevelsChange([...selectedLevels, value]);
        }
    };

    const toggleTag = (value: ContentTag) => {
        if (selectedTags.includes(value)) {
            onTagsChange(selectedTags.filter((t) => t !== value));
        } else {
            onTagsChange([...selectedTags, value]);
        }
    };

    return (
        <SettingsSection
            title="Content Selection"
            isExpanded={isExpanded}
            onToggle={() => setIsExpanded(!isExpanded)}
            indicatorColor="bg-blue-500"
        >
            <div className="space-y-6">
                {/* JLPT Levels */}
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">JLPT Level</h4>
                    <div className="flex flex-wrap gap-2">
                        {JLPT_LEVELS.map(({ value, label, color }) => {
                            const isSelected = selectedLevels.includes(value);
                            return (
                                <button
                                    key={value}
                                    onClick={() => toggleLevel(value)}
                                    className={`
                    px-3 py-1.5 rounded-full text-sm font-medium border transition-all
                    ${isSelected
                                            ? `${color} border-current shadow-sm`
                                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}
                  `}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Tags */}
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Topics</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {CONTENT_TAGS.map(({ value, label, icon }) => {
                            const isSelected = selectedTags.includes(value);
                            return (
                                <button
                                    key={value}
                                    onClick={() => toggleTag(value)}
                                    className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border text-left
                    ${isSelected
                                            ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}
                  `}
                                >
                                    <span>{icon}</span>
                                    <span>{label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </SettingsSection>
    );
}
