'use client';

import { useState } from 'react';
import { SettingsSection } from './settings-section';
import { InputMode } from '@/entities/flashcards/settings';

export interface InputConfigProps {
  inputMode: 'view-only' | InputMode[];
  onChange: (mode: 'view-only' | InputMode[]) => void;
}

// Reusing DisplayMode types but ensuring we cover sensible inputs
const ALL_INPUTS: { value: InputMode; label: string; description: string; color: string }[] = [
  {
    value: 'english',
    label: 'English',
    description: 'Type English translation',
    color: 'bg-yellow-400'
  },
  {
    value: 'romaji',
    label: 'Romaji',
    description: 'Type Romaji (e.g. "neko")',
    color: 'bg-purple-400'
  },
  {
    value: 'kana',
    label: 'Kana (Direct)',
    description: 'Type Hiragana/Katakana directly',
    color: 'bg-blue-400'
  },
  {
    value: 'kanji',
    label: 'Kanji',
    description: 'Type Kanji directly',
    color: 'bg-red-400'
  },
];

export function InputConfig({
  inputMode,
  onChange,
}: InputConfigProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const isViewOnly = inputMode === 'view-only';

  const handleModeChange = (mode: 'view-only' | 'interactive') => {
    if (mode === 'view-only') {
      onChange('view-only');
    } else {
      // Default to English if switching to interactive and nothing selected
      onChange(['english']);
    }
  };

  const handleInputToggle = (mode: InputMode, checked: boolean) => {
    if (inputMode === 'view-only') return; // Should not happen given UI state

    let newModes = [...inputMode];
    if (checked) {
      if (!newModes.includes(mode)) newModes.push(mode);
    } else {
      newModes = newModes.filter(m => m !== mode);
    }

    // Prevent deselecting all? Or allow it implies "View Only"?
    // Use case says: Multi choice. If all deselected, effectively view only? 
    // Let's allow empty array but typically at least one is needed for "Interactive".
    // If empty -> maybe warn or just allow.
    onChange(newModes);
  };

  return (
    <SettingsSection
      title="User Input Interface"
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
      indicatorColor="bg-emerald-500"
    >
      <div className="space-y-6">
        {/* Main Mode Selection */}
        <div className="flex gap-4">
          <label className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all ${isViewOnly ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="radio"
                name="input-type"
                checked={isViewOnly}
                onChange={() => handleModeChange('view-only')}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-semibold text-gray-900">View Only</span>
            </div>
            <p className="text-sm text-gray-500 pl-6">No typing required. Just reveal the answer.</p>
          </label>

          <label className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all ${!isViewOnly ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="radio"
                name="input-type"
                checked={!isViewOnly}
                onChange={() => handleModeChange('interactive')}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-semibold text-gray-900">Interactive</span>
            </div>
            <p className="text-sm text-gray-500 pl-6">Type the answer in the selected scripts.</p>
          </label>
        </div>

        {/* Interactive Options */}
        {!isViewOnly && (
          <div className="pl-1 animate-in fade-in slide-in-from-top-2 duration-300">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Allowed Input Scripts</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ALL_INPUTS.map(({ value, label, description }) => (
                <label key={value} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={(inputMode as InputMode[]).includes(value)}
                    onChange={(e) => handleInputToggle(value, e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700 block">{label}</span>
                    <span className="text-xs text-gray-500">{description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}
