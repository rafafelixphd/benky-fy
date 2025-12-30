'use client';

import { useState } from 'react';
import { SettingsSection } from './settings-section';

export interface WordTypeSelectorProps {
  wordTypes: {
    hiragana: boolean;
    katakana: boolean;
    kanji: boolean;
    english: boolean;
  };
  weights: {
    hiragana: number;
    katakana: number;
    kanji: number;
    english: number;
  };
  onWordTypeChange: (type: string, enabled: boolean) => void;
  onWeightChange: (type: string, weight: number) => void;
}

export function WordTypeSelector({
  wordTypes,
  weights,
  onWordTypeChange,
  onWeightChange,
}: WordTypeSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  const enabledTypes = Object.entries(wordTypes).filter(([_, enabled]) => enabled);

  const normalizeWeights = () => {
    if (totalWeight === 0) return;
    const enabledWeight = enabledTypes.reduce((sum, [type]) => sum + weights[type as keyof typeof weights], 0);
    if (enabledWeight === 0) return;
    
    enabledTypes.forEach(([type]) => {
      const normalizedWeight = (weights[type as keyof typeof weights] / enabledWeight) * 100;
      onWeightChange(type, Math.round(normalizedWeight));
    });
  };

  const handleWeightChange = (type: string, newWeight: number) => {
    onWeightChange(type, newWeight);
    // Auto-normalize other weights
    setTimeout(normalizeWeights, 100);
  };

  return (
    <SettingsSection
      title="Word Type Selection"
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
      indicatorColor="bg-purple-500"
    >
      <div className="space-y-4">
        {/* Word Type Checkboxes */}
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(wordTypes).map(([type, enabled]) => (
            <label key={type} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => onWordTypeChange(type, e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-700 capitalize">
                {type}
              </span>
            </label>
          ))}
        </div>

        {/* Weight Distribution */}
        {enabledTypes.length > 1 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Weight Distribution</h4>
              <span className="text-xs text-gray-500">
                Total: {totalWeight.toFixed(0)}%
              </span>
            </div>
            
            {enabledTypes.map(([type]) => (
              <div key={type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600 capitalize">
                    {type}
                  </label>
                  <span className="text-sm font-medium text-gray-700">
                    {weights[type as keyof typeof weights].toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights[type as keyof typeof weights]}
                  onChange={(e) => handleWeightChange(type, Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            ))}

            {/* Weight Visualization */}
            <div className="mt-4">
              <div className="flex h-4 bg-gray-200 rounded-lg overflow-hidden">
                {enabledTypes.map(([type]) => {
                  const percentage = (weights[type as keyof typeof weights] / totalWeight) * 100;
                  const colors = {
                    hiragana: 'bg-blue-400',
                    katakana: 'bg-green-400', 
                    kanji: 'bg-red-400',
                    english: 'bg-yellow-400'
                  };
                  return (
                    <div
                      key={type}
                      className={`${colors[type as keyof typeof colors]} transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                      title={`${type}: ${percentage.toFixed(1)}%`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            <span className="font-medium">💡 Tip:</span> Weights determine how often each word type appears. 
            Higher weights = more frequent appearance.
          </p>
        </div>
      </div>
    </SettingsSection>
  );
}
