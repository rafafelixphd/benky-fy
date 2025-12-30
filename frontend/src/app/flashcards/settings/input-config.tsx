'use client';

import { useState } from 'react';
import { SettingsSection } from './settings-section';
import { DisplayMode } from '@/entities/flashcards/settings';

export interface InputConfigProps {
  weights: Partial<Record<DisplayMode, number>>;
  onChange: (weights: Partial<Record<DisplayMode, number>>) => void;
}

// Reusing DisplayMode types but ensuring we cover sensible inputs
const ALL_INPUTS: { value: DisplayMode; label: string; description: string; color: string }[] = [
  {
    value: 'en',
    label: 'English',
    description: 'Type English translation',
    color: 'bg-yellow-400'
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
  // 'katakana', 'furigana' might behave same as 'kana' or be specific. Including for completeness if backend supports.
  {
    value: 'katakana',
    label: 'Katakana',
    description: 'Type Katakana',
    color: 'bg-green-400'
  },
];

export function InputConfig({
  weights,
  onChange,
}: InputConfigProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const enabledInputs = ALL_INPUTS.filter(m => weights[m.value] !== undefined);
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + (w || 0), 0);

  const normalizeWeights = (currentWeights: Partial<Record<DisplayMode, number>>) => {
    const keys = Object.keys(currentWeights) as DisplayMode[];
    const currentTotal = keys.reduce((sum, key) => sum + (currentWeights[key] || 0), 0);

    if (currentTotal === 0 || keys.length === 0) return currentWeights;

    const normalized: Partial<Record<DisplayMode, number>> = {};
    keys.forEach(key => {
      normalized[key] = Math.round(((currentWeights[key] || 0) / currentTotal) * 100);
    });
    return normalized;
  };

  const handleToggle = (mode: DisplayMode, enabled: boolean) => {
    const newWeights = { ...weights };
    if (enabled) {
      newWeights[mode] = 50;
    } else {
      delete newWeights[mode];
    }
    onChange(normalizeWeights(newWeights));
  };

  const handleWeightChange = (mode: DisplayMode, newWeight: number) => {
    const newWeights = { ...weights, [mode]: newWeight };
    onChange(newWeights);
  };

  return (
    <SettingsSection
      title="Input Configuration"
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
      indicatorColor="bg-emerald-500"
    >
      <div className="space-y-4">
        {/* Input Checkboxes */}
        <div className="space-y-3">
          {ALL_INPUTS.map(({ value, label, description }) => (
            <label key={value} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={weights[value] !== undefined}
                onChange={(e) => handleToggle(value, e.target.checked)}
                className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <div className="text-xs text-gray-500 mt-1">{description}</div>
              </div>
            </label>
          ))}
        </div>

        {/* Weight Sliders */}
        {enabledInputs.length > 1 && (
          <div className="space-y-3 border-t pt-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Input Probability</h4>
              <span className={`text-xs ${totalWeight !== 100 ? 'text-amber-600' : 'text-gray-500'}`}>
                Total: {totalWeight}%
              </span>
            </div>

            {enabledInputs.map(({ value, label }) => (
              <div key={value} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">{label}</label>
                  <span className="text-sm font-medium text-gray-700">
                    {weights[value]}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights[value] || 0}
                  onChange={(e) => handleWeightChange(value, Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            ))}
          </div>
        )}

        {/* Visual Bar */}
        {enabledInputs.length > 0 && (
          <div className="mt-4">
            <div className="flex h-6 bg-gray-200 rounded-lg overflow-hidden">
              {enabledInputs.map(({ value, color, label }) => {
                const weight = weights[value] || 0;
                if (weight <= 0) return null;
                const percentage = (weight / totalWeight) * 100; // Visual percentage
                return (
                  <div
                    key={value}
                    className={`${color} transition-all duration-300 flex items-center justify-center`}
                    style={{ width: `${percentage}%` }}
                    title={`${label}: ${weight}%`}
                  >
                    {percentage > 10 && (
                      <span className="text-xs font-medium text-white shadow-sm">
                        {weight}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}
