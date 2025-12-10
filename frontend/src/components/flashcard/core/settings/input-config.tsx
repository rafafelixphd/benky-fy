'use client';

import { useState } from 'react';
import { SettingsSection } from './settings-section';

export interface InputConfigProps {
  inputModes: {
    hiragana: boolean;
    katakana: boolean;
    kanji: boolean;
    romaji: boolean;
    english: boolean;
  };
  modeWeights: {
    hiragana: number;
    katakana: number;
    kanji: number;
    romaji: number;
    english: number;
  };
  onInputModeChange: (mode: string, enabled: boolean) => void;
  onModeWeightChange: (mode: string, weight: number) => void;
}

export function InputConfig({
  inputModes,
  modeWeights,
  onInputModeChange,
  onModeWeightChange,
}: InputConfigProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const totalWeight = Object.values(modeWeights).reduce((sum, weight) => sum + weight, 0);
  const enabledModes = Object.entries(inputModes).filter(([_, enabled]) => enabled);

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
      hiragana: 'Hiragana (ひらがな)',
      katakana: 'Katakana (カタカナ)',
      kanji: 'Kanji (漢字)',
      romaji: 'Romaji (romanized)',
      english: 'English'
    };
    return labels[mode as keyof typeof labels] || mode;
  };

  const getModeColor = (mode: string) => {
    const colors = {
      hiragana: 'bg-blue-400',
      katakana: 'bg-green-400',
      kanji: 'bg-red-400',
      romaji: 'bg-purple-400',
      english: 'bg-yellow-400'
    };
    return colors[mode as keyof typeof colors] || 'bg-gray-400';
  };

  const getModeDescription = (mode: string) => {
    const descriptions = {
      hiragana: 'Type hiragana characters directly',
      katakana: 'Type katakana characters directly',
      kanji: 'Type kanji characters directly',
      romaji: 'Type romanized Japanese (converts to kana)',
      english: 'Type English translations'
    };
    return descriptions[mode as keyof typeof descriptions] || '';
  };

  return (
    <SettingsSection
      title="Input Mode Configuration"
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
      indicatorColor="bg-emerald-500"
    >
      <div className="space-y-4">
        {/* Input Mode Checkboxes */}
        <div className="space-y-3">
          {Object.entries(inputModes).map(([mode, enabled]) => (
            <label key={mode} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => onInputModeChange(mode, e.target.checked)}
                className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-700">
                  {getModeLabel(mode)}
                </span>
                <div className="text-xs text-gray-500 mt-1">
                  {getModeDescription(mode)}
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Mode Weight Distribution */}
        {enabledModes.length > 1 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Input Mode Distribution</h4>
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

        {/* Input Preview */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Input Preview</h5>
          <div className="text-sm text-gray-600">
            {enabledModes.length === 0 ? (
              <span className="text-gray-400 italic">Select at least one input mode</span>
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

        {/* Input Examples */}
        {enabledModes.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <h6 className="text-xs font-medium text-emerald-700 mb-2">Input Examples:</h6>
            <div className="text-xs text-emerald-600 space-y-1">
              {enabledModes.map(([mode]) => (
                <div key={mode}>
                  <span className="font-medium">{getModeLabel(mode)}:</span>
                  {mode === 'hiragana' && ' こんにちは'}
                  {mode === 'katakana' && ' コンニチハ'}
                  {mode === 'kanji' && ' 今日は'}
                  {mode === 'romaji' && ' konnichiwa'}
                  {mode === 'english' && ' hello'}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          <p className="text-xs text-emerald-700">
            <span className="font-medium">💡 Tip:</span> Input modes determine how users can answer flashcards. 
            Weights control frequency - higher weights appear more often.
          </p>
        </div>
      </div>
    </SettingsSection>
  );
}
