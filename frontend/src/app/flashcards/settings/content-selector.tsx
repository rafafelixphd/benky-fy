'use client';

import { useState, useEffect } from 'react';
import { SettingsSection } from './settings-section';
import { ContentTag, JLPTLevel, JLPT_LEVELS, CONTENT_TAGS, Level } from '@/entities/flashcards/settings';
import { Input } from "@/components/ui/input";

export interface ContentSelectorProps {
    selectedLevel?: Level;
    selectedTags?: ContentTag[];
    onLevelChange: (level?: Level) => void;
    onTagsChange: (tags?: ContentTag[]) => void;
}

export function ContentSelector({
    selectedLevel,
    selectedTags,
    onLevelChange,
    onTagsChange,
}: ContentSelectorProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    // Filter Enable States
    const [jlptEnabled, setJlptEnabled] = useState(!!selectedLevel?.jlpt);
    const [customEnabled, setCustomEnabled] = useState(!!selectedLevel?.custom);
    const [tagsEnabled, setTagsEnabled] = useState(!!selectedTags && selectedTags.length > 0);

    // Local state for values to persist when toggled off
    const [jlptValue, setJlptValue] = useState<JLPTLevel>(selectedLevel?.jlpt || 'N5');
    const [customValue, setCustomValue] = useState<number>(selectedLevel?.custom || 1);
    
    // Determine effective tags state
    const effectiveTags = selectedTags || [];

    // Effect to update parent when filters change
    useEffect(() => {
        const newLevel: Level = {
            jlpt: jlptEnabled ? jlptValue : undefined as any, // Cast to any because type definition might be strict, but we want to omit if undefined
            custom: customEnabled ? customValue : undefined as any
        };

        // If both are undefined, we might want to pass undefined for the whole level object
        // depending on how strict the backend is. But the interface says `jlpt` and `custom` are required in `Level` type?
        // Wait, `Level` type in settings.ts is:
        // export type Level = { jlpt: JLPTLevel; custom: number; };
        // If we want them optional, we need to change Level definition OR make `level` partial in usage.
        // Actually, I should update `Level` type to be partial or create a PartialLevel type.
        // For now, let's assume we construct a Partial<Level> but cast it, or better yet, the parent expects `Level`?
        // Parent `FlashcardSettings` has `level?: Level`.
        // If `Level` has mandatory fields, we can't pass partial.
        // I should probably update `Level` type in settings.ts as well to be optional fields?
        // The user asked "can we also set things as optional".
        // Let's assume for this file we try to construct it.
        
        // Actually, if I disable a filter, I should probably remove it from the object.
        // If both are disabled, level is undefined.
        
        const effectiveLevel: Level | undefined = (jlptEnabled || customEnabled) ? {
             jlpt: jlptEnabled ? jlptValue : (undefined as any),
             custom: customEnabled ? customValue : (undefined as any)
        } : undefined;

        if (JSON.stringify(effectiveLevel) !== JSON.stringify(selectedLevel)) {
             onLevelChange(effectiveLevel);
        }

    }, [jlptEnabled, customEnabled, jlptValue, customValue]); 

     // Separate effect for tags to avoid circular dependency loops if object ref changes
     useEffect(() => {
        if (tagsEnabled) {
            // function ref passed to onTagsChange handles the update logic generally
        } else {
             if (selectedTags !== undefined) {
                 onTagsChange(undefined);
             }
        }
     }, [tagsEnabled]);


    const handleJlptChange = (value: JLPTLevel) => {
        setJlptValue(value);
        // Direct update to parent handled by effect? 
        // Better to be explicit to avoid effect race conditions or double renders.
        // But implementing via effect simplifies the "combo" logic.
        // Let's stick to direct updates for immediate responsiveness.
        const newLevel = { 
            ...(selectedLevel || {}), 
            jlpt: value 
        } as Level;
        // Ensure custom is preserved if enabled
        if (!customEnabled) delete (newLevel as any).custom;
        onLevelChange(newLevel);
    };

    const handleCustomChange = (value: number) => {
        setCustomValue(value);
        const newLevel = { 
            ...(selectedLevel || {}), 
            custom: value 
        } as Level;
         if (!jlptEnabled) delete (newLevel as any).jlpt;
        onLevelChange(newLevel);
    };

    const toggleTag = (value: ContentTag) => {
        if (!tagsEnabled) return;
        const current = selectedTags || [];
        if (current.includes(value)) {
            onTagsChange(current.filter((t) => t !== value));
        } else {
            onTagsChange([...current, value]);
        }
    };
    
    // Toggle Handlers
    // Toggle Handlers
    const toggleJlptFilter = (checked: boolean) => {
        setJlptEnabled(checked);
        if (checked) {
             setCustomEnabled(false); // Mutual exclusion
             onLevelChange({ jlpt: jlptValue } as Level);
        } else {
             // Disabled, and since custom is mutually exclusive, level is undefined
             onLevelChange(undefined);
        }
    };
    
    const toggleCustomFilter = (checked: boolean) => {
        setCustomEnabled(checked);
        if (checked) {
             setJlptEnabled(false); // Mutual exclusion
             onLevelChange({ custom: customValue } as Level);
        } else {
             // Disabled, and since jlpt is mutually exclusive, level is undefined
             onLevelChange(undefined);
        }
    };

    const toggleTagsFilter = (checked: boolean) => {
        setTagsEnabled(checked);
        if (checked) {
            onTagsChange([]); 
        } else {
            onTagsChange(undefined);
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
                    <div className="flex items-center space-x-2 mb-3">
                        <input 
                            type="checkbox"
                            id="jlpt-filter" 
                            checked={jlptEnabled} 
                            onChange={(e) => toggleJlptFilter(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" 
                        />
                        <label 
                            htmlFor="jlpt-filter" 
                            className="text-sm font-medium text-gray-700 cursor-pointer"
                        >
                            Filter by JLPT Level
                        </label>
                    </div>
                    
                    {jlptEnabled && (
                        <div className="flex flex-wrap gap-2 ml-6 animate-in slide-in-from-top-2 duration-200">
                            {JLPT_LEVELS.map(({ value, label, color }) => {
                                const isSelected = selectedLevel?.jlpt === value;
                                return (
                                    <button
                                        key={value}
                                        onClick={() => handleJlptChange(value)}
                                        className={`
                        px-3 py-1.5 rounded-full text-sm font-medium border transition-all
                        ${isSelected
                                                ? `${color} border-current shadow-sm ring-1 ring-offset-1`
                                                : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}
                      `}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                 {/* Custom Level */}
                 <div>
                    <div className="flex items-center space-x-2 mb-3">
                        <input 
                            type="checkbox"
                            id="custom-filter" 
                            checked={customEnabled} 
                            onChange={(e) => toggleCustomFilter(e.target.checked)}
                             className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                         <label 
                            htmlFor="custom-filter" 
                            className="text-sm font-medium text-gray-700 cursor-pointer"
                        >
                            Filter by Custom Level
                        </label>
                    </div>

                    {customEnabled && (
                        <div className="ml-6 animate-in slide-in-from-top-2 duration-200">
                             <Input
                                type="number"
                                value={customValue}
                                onChange={(e) => handleCustomChange(parseInt(e.target.value) || 0)}
                                className="max-w-[120px]"
                                placeholder="Level ID"
                            />
                            <p className="text-xs text-gray-500 mt-1">Enter the custom level ID number.</p>
                        </div>
                    )}
                </div>

                {/* Content Tags */}
                <div>
                     <div className="flex items-center space-x-2 mb-3">
                        <input 
                            type="checkbox"
                            id="tags-filter" 
                            checked={tagsEnabled} 
                            onChange={(e) => toggleTagsFilter(e.target.checked)} 
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <label 
                            htmlFor="tags-filter" 
                            className="text-sm font-medium text-gray-700 cursor-pointer"
                        >
                             Filter by Topics
                        </label>
                    </div>

                    {tagsEnabled && (
                        <div className="grid grid-cols-2 gap-2 ml-6 animate-in slide-in-from-top-2 duration-200">
                            {CONTENT_TAGS.map(({ value, label, icon }) => {
                                const isSelected = selectedTags?.includes(value);
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
                    )}
                </div>
            </div>
        </SettingsSection>
    );
}
