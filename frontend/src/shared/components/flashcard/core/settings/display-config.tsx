'use client';

import { useState } from 'react';
import { SettingsSection } from './settings-section';

export interface DisplayConfigProps {
  displayModes: {
    kana: boolean;
    kanji: boolean;
    kanji_furigana: boolean;
    english: boolean;
  };
  modeWeights: {
    kana: number;
    kanji: number;
    kanji_furigana: number;
    english: number;
  };
  onDisplayModeChange: (mode: string, enabled: boolean) => void;
  onModeWeightChange: (mode: string, weight: number) => void;
}

export function DisplayConfig({
  displayModes,
  modeWeights,
  onDisplayModeChange,
  onModeWeightChange,
}: DisplayConfigProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const totalWeight = Object.values(modeWeights).reduce((sum, weight) => sum + weight, 0);
  const enabledModes = Object.entries(displayModes).filter(([_, enabled]) => enabled);

  const normalizeWeights = () => {
    if (totalWeight === 0) return;
    const enabledWeight = enabledModes.reduce((sum, [mode]) => sum + modeWeights[mode as keyof typeof modeWeights], 0);
    if (enabledWeight === 0) return;
    
    enabledModes.forEach(([mode]) => {
      const normalizedWeight = (modeWeights[mode as keyof typeof modeWeights] / enabledWeight) * 100;
      onModeWeightChange(mode, Math.round(normalizedWeight));
    });
  };

  const handleWeightChange = (mode: string, newWeight: number) => {
    onModeWeightChange(mode, newWeight);
    // Auto-normalize other weights
    setTimeout(normalizeWeights, 100);
  };

  const getModeLabel = (mode: string) => {
    const labels = {
      kana: 'Kana (ひらがな/カタカナ)',
      kanji: 'Kanji (漢字)',
      kanji_furigana: 'Kanji + Furigana (漢字+ふりがな)',
      english: 'English'
    };
    return labels[mode as keyof typeof labels] || mode;
  };

  const getModeColor = (mode: string) => {
    const colors = {
      kana: 'bg-blue-400',
      kanji: 'bg-red-400',
      kanji_furigana: 'bg-purple-400',
      english: 'bg-green-400'
    };
    return colors[mode as keyof typeof colors] || 'bg-gray-400';
  };

  return (
    <SettingsSection
      title="Display Mode Configuration"
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
      indicatorColor="bg-indigo-500"
    >
      <div className="space-y-4">
        {/* Display Mode Checkboxes */}
        <div className="space-y-3">
          {Object.entries(displayModes).map(([mode, enabled]) => (
            <label key={mode} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => onDisplayModeChange(mode, e.target.checked)}
                className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-700">
                  {getModeLabel(mode)}
                </span>
                <div className="text-xs text-gray-500 mt-1">
                  {mode === 'kana' && 'Shows hiragana or katakana characters'}
                  {mode === 'kanji' && 'Shows kanji characters only'}
                  {mode === 'kanji_furigana' && 'Shows kanji with reading assistance'}
                  {mode === 'english' && 'Shows English translation'}
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Mode Weight Distribution */}
        {enabledModes.length > 1 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Mode Distribution</h4>
              <span className="text-xs text-gray-500">
                Total: {totalWeight.toFixed(0)}%
              </span>
            </div>
            
            {enabledModes.map(([mode]) => (
              <div key={mode} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">
                    {getModeLabel(mode)}
                  </label>
                  <span className="text-sm font-medium text-gray-700">
                    {modeWeights[mode as keyof typeof modeWeights].toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={modeWeights[mode as keyof typeof modeWeights]}
                  onChange={(e) => handleWeightChange(mode, Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            ))}

            {/* Mode Visualization */}
            <div className="mt-4">
              <div className="flex h-6 bg-gray-200 rounded-lg overflow-hidden">
                {enabledModes.map(([mode]) => {
                  const percentage = (modeWeights[mode as keyof typeof modeWeights] / totalWeight) * 100;
                  return (
                    <div
                      key={mode}
                      className={`${getModeColor(mode)} transition-all duration-300 flex items-center justify-center`}
                      style={{ width: `${percentage}%` }}
                      title={`${getModeLabel(mode)}: ${percentage.toFixed(1)}%`}
                    >
                      {percentage > 15 && (
                        <span className="text-xs font-medium text-white">
                          {percentage.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Preview</h5>
          <div className="text-sm text-gray-600">
            {enabledModes.length === 0 ? (
              <span className="text-gray-400 italic">Select at least one display mode</span>
            ) : (
              <div className="space-y-1">
                {enabledModes.map(([mode]) => (
                  <div key={mode} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getModeColor(mode)}`} />
                    <span>{getModeLabel(mode)}</span>
                    <span className="text-gray-400">
                      ({modeWeights[mode as keyof typeof modeWeights].toFixed(0)}%)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
          <p className="text-xs text-indigo-700">
            <span className="font-medium">💡 Tip:</span> Display modes determine how flashcards are shown. 
            Weights control frequency - higher weights appear more often.
          </p>
        </div>
      </div>
    </SettingsSection>
  );
}
