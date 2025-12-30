'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { X, Settings as SettingsIcon } from "lucide-react";
import { ContentSelector } from './content-selector';
import { PartOfSpeechSelector } from './part-of-speech-selector';
import { InputConfig } from './input-config';
import { FlashcardSettings, DEFAULT_FLASHCARD_SETTINGS, DisplayMode } from '@/entities/flashcards/settings';

export interface FlashcardSettingsModalProps {
    onClose: () => void;
    onSave: (settings: FlashcardSettings) => void;
    initialSettings?: FlashcardSettings;
}

export function FlashcardSettingsModal({
    onClose,
    onSave,
    initialSettings = DEFAULT_FLASHCARD_SETTINGS,
}: FlashcardSettingsModalProps) {
    const [settings, setSettings] = useState<FlashcardSettings>(initialSettings);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(settings);
            onClose();
        } catch (error) {
            console.error("Failed to save custom flashcard settings:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setSettings(DEFAULT_FLASHCARD_SETTINGS);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-background z-10">
                    <div className="flex items-center gap-2">
                        <SettingsIcon className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-lg font-semibold">Custom Flashcard Settings</h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-8 w-8 p-0"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <ContentSelector
                        selectedLevels={settings.level}
                        selectedTags={settings.tag}
                        onLevelsChange={(level) => setSettings(s => ({ ...s, level }))}
                        onTagsChange={(tag) => setSettings(s => ({ ...s, tag }))}
                    />

                    <PartOfSpeechSelector
                        selected={settings.partOfSpeech}
                        onChange={(partOfSpeech) => setSettings(s => ({ ...s, partOfSpeech }))}
                    />

                    <InputConfig
                        weights={settings.display.input}
                        onChange={(input) => setSettings(s => ({ ...s, display: { ...s.display, input } }))}
                    />
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t sticky bottom-0 bg-background">
                    <Button onClick={handleSave} disabled={isSaving} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                        {isSaving ? "Saving..." : "Start Session"}
                    </Button>
                    <Button variant="outline" onClick={handleReset} disabled={isSaving}>
                        Reset to Defaults
                    </Button>
                </div>
            </div>
        </div>
    );
}
