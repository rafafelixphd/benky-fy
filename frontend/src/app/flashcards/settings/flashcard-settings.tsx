// ... imports
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Settings as SettingsIcon } from "lucide-react";
import { ContentSelector } from './content-selector';
import { PartOfSpeechSelector } from './part-of-speech-selector';
import { InputConfig } from './input-config';
import { FlashcardSettings, DEFAULT_FLASHCARD_SETTINGS, CardDisplayMode } from '@/entities/flashcards/settings';
import { SettingsSection } from './settings-section';

export interface FlashcardSettingsModalProps {
    onClose: () => void;
    onSave: (settings: FlashcardSettings) => void;
    initialSettings?: FlashcardSettings;
}

const CARD_DISPLAY_MODES: { value: CardDisplayMode; label: string }[] = [
    { value: 'english', label: 'English' },
    { value: 'kana', label: 'Kana' },
    { value: 'kanji', label: 'Kanji' },
];

export function FlashcardSettingsModal({
    onClose,
    onSave,
    initialSettings = DEFAULT_FLASHCARD_SETTINGS,
}: FlashcardSettingsModalProps) {
    const [settings, setSettings] = useState<FlashcardSettings>(initialSettings);
    const [isSaving, setIsSaving] = useState(false);
    const [displayExpanded, setDisplayExpanded] = useState(true);

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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                            <SettingsIcon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h2 className="text-lg font-semibold">Custom Flashcard Settings</h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-8 w-8 p-0 hover:bg-slate-100 rounded-full"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8">
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

                    <SettingsSection
                        title="Display & Constraints"
                        isExpanded={displayExpanded}
                        onToggle={() => setDisplayExpanded(!displayExpanded)}
                        indicatorColor="bg-blue-500"
                    >
                        <div className="space-y-6">
                            {/* Max Cards */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Max Cards per Session</label>
                                <Input
                                    type="number"
                                    min={5}
                                    max={100}
                                    value={settings.maxCards}
                                    onChange={(e) => setSettings(s => ({ ...s, maxCards: parseInt(e.target.value) || 10 }))}
                                    className="max-w-[120px]"
                                />
                                <p className="text-xs text-gray-500">Maximum number of cards to review in this session.</p>
                            </div>

                            {/* Card Display */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700">Card Display (Front)</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {CARD_DISPLAY_MODES.map((mode) => (
                                        <label
                                            key={mode.value}
                                            className={`
                                                flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all
                                                ${settings.display.cardDisplay === mode.value
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium ring-1 ring-blue-500'
                                                    : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'}
                                            `}
                                        >
                                            <input
                                                type="radio"
                                                name="cardDisplay"
                                                value={mode.value}
                                                checked={settings.display.cardDisplay === mode.value}
                                                onChange={() => setSettings(s => ({
                                                    ...s,
                                                    display: { ...s.display, cardDisplay: mode.value }
                                                }))}
                                                className="sr-only"
                                            />
                                            {mode.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </SettingsSection>

                    <InputConfig
                        inputMode={settings.display.inputMode}
                        onChange={(inputMode) => setSettings(s => ({
                            ...s,
                            display: { ...s.display, inputMode }
                        }))}
                    />
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
