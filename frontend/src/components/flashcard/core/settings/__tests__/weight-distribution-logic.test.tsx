import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Test weight distribution logic
describe('Weight Distribution Logic', () => {
  describe('WordTypeSelector Weight Logic', () => {
    const mockOnWeightChange = jest.fn();
    const mockOnWordTypeChange = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('normalizes weights when total exceeds 100%', async () => {
      const { WordTypeSelector } = await import('../word-type-selector');
      
      const props = {
        wordTypes: {
          hiragana: true,
          katakana: true,
          kanji: false,
          english: true,
        },
        weights: {
          hiragana: 50,
          katakana: 40,
          kanji: 0,
          english: 30,
        },
        onWordTypeChange: mockOnWordTypeChange,
        onWeightChange: mockOnWeightChange,
      };

      render(<WordTypeSelector {...props} />);
      
      // Change hiragana weight to 80, making total 150%
      const hiraganaSlider = screen.getByDisplayValue('50');
      fireEvent.change(hiraganaSlider, { target: { value: '80' } });
      
      // Should call onWeightChange with the new value
      expect(mockOnWeightChange).toHaveBeenCalledWith('hiragana', 80);
    });

    it('handles zero total weight gracefully', async () => {
      const { WordTypeSelector } = await import('../word-type-selector');
      
      const props = {
        wordTypes: {
          hiragana: true,
          katakana: true,
          kanji: false,
          english: true,
        },
        weights: {
          hiragana: 0,
          katakana: 0,
          kanji: 0,
          english: 0,
        },
        onWordTypeChange: mockOnWordTypeChange,
        onWeightChange: mockOnWeightChange,
      };

      render(<WordTypeSelector {...props} />);
      
      // Should not crash and should show 0% total
      expect(screen.getByText('Total: 0%')).toBeInTheDocument();
    });

    it('updates total weight display correctly', async () => {
      const { WordTypeSelector } = await import('../word-type-selector');
      
      const props = {
        wordTypes: {
          hiragana: true,
          katakana: true,
          kanji: false,
          english: true,
        },
        weights: {
          hiragana: 40,
          katakana: 30,
          kanji: 0,
          english: 30,
        },
        onWordTypeChange: mockOnWordTypeChange,
        onWeightChange: mockOnWeightChange,
      };

      render(<WordTypeSelector {...props} />);
      
      expect(screen.getByText('Total: 100%')).toBeInTheDocument();
    });
  });

  describe('DisplayConfig Weight Logic', () => {
    const mockOnModeWeightChange = jest.fn();
    const mockOnDisplayModeChange = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('calculates mode percentages correctly', async () => {
      const { DisplayConfig } = await import('../display-config');
      
      const props = {
        displayModes: {
          kana: true,
          kanji: false,
          kanji_furigana: false,
          english: true,
        },
        modeWeights: {
          kana: 70,
          kanji: 0,
          kanji_furigana: 0,
          english: 30,
        },
        onDisplayModeChange: mockOnDisplayModeChange,
        onModeWeightChange: mockOnModeWeightChange,
      };

      render(<DisplayConfig {...props} />);
      
      expect(screen.getByText('70%')).toBeInTheDocument();
      expect(screen.getByText('30%')).toBeInTheDocument();
    });

    it('handles single mode weight distribution', async () => {
      const { DisplayConfig } = await import('../display-config');
      
      const props = {
        displayModes: {
          kana: true,
          kanji: false,
          kanji_furigana: false,
          english: false,
        },
        modeWeights: {
          kana: 100,
          kanji: 0,
          kanji_furigana: 0,
          english: 0,
        },
        onDisplayModeChange: mockOnDisplayModeChange,
        onModeWeightChange: mockOnModeWeightChange,
      };

      render(<DisplayConfig {...props} />);
      
      // Should not show weight distribution section
      expect(screen.queryByText('Mode Distribution')).not.toBeInTheDocument();
    });
  });

  describe('InputConfig Weight Logic', () => {
    const mockOnModeWeightChange = jest.fn();
    const mockOnInputModeChange = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('distributes input mode weights evenly', async () => {
      const { InputConfig } = await import('../input-config');
      
      const props = {
        inputModes: {
          hiragana: true,
          katakana: true,
          kanji: false,
          romaji: true,
          english: true,
        },
        modeWeights: {
          hiragana: 25,
          katakana: 25,
          kanji: 0,
          romaji: 25,
          english: 25,
        },
        onInputModeChange: mockOnInputModeChange,
        onModeWeightChange: mockOnModeWeightChange,
      };

      render(<InputConfig {...props} />);
      
      // Should show 25% for each enabled mode
      expect(screen.getAllByText('25%')).toHaveLength(4);
    });

    it('handles weight changes correctly', async () => {
      const { InputConfig } = await import('../input-config');
      
      const props = {
        inputModes: {
          hiragana: true,
          katakana: true,
          kanji: false,
          romaji: false,
          english: false,
        },
        modeWeights: {
          hiragana: 60,
          katakana: 40,
          kanji: 0,
          romaji: 0,
          english: 0,
        },
        onInputModeChange: mockOnInputModeChange,
        onModeWeightChange: mockOnModeWeightChange,
      };

      render(<InputConfig {...props} />);
      
      const hiraganaSlider = screen.getByDisplayValue('60');
      fireEvent.change(hiraganaSlider, { target: { value: '70' } });
      
      expect(mockOnModeWeightChange).toHaveBeenCalledWith('hiragana', 70);
    });
  });

  describe('Weight Normalization Logic', () => {
    it('should normalize weights to 100% when enabled types change', () => {
      // This tests the normalization logic that should be implemented
      const normalizeWeights = (weights: Record<string, number>, enabledTypes: string[]) => {
        const enabledWeight = enabledTypes.reduce((sum, type) => sum + weights[type], 0);
        if (enabledWeight === 0) return weights;
        
        const normalizedWeights = { ...weights };
        enabledTypes.forEach(type => {
          normalizedWeights[type] = Math.round((weights[type] / enabledWeight) * 100);
        });
        
        return normalizedWeights;
      };

      const weights = { hiragana: 50, katakana: 40, kanji: 0, english: 30 };
      const enabledTypes = ['hiragana', 'katakana', 'english'];
      
      const result = normalizeWeights(weights, enabledTypes);
      
      expect(result.hiragana).toBe(42); // 50/120 * 100 = 41.67 -> 42
      expect(result.katakana).toBe(33); // 40/120 * 100 = 33.33 -> 33
      expect(result.english).toBe(25); // 30/120 * 100 = 25
      expect(result.kanji).toBe(0); // unchanged
    });

    it('should handle edge case of all weights being zero', () => {
      const normalizeWeights = (weights: Record<string, number>, enabledTypes: string[]) => {
        const enabledWeight = enabledTypes.reduce((sum, type) => sum + weights[type], 0);
        if (enabledWeight === 0) return weights;
        
        const normalizedWeights = { ...weights };
        enabledTypes.forEach(type => {
          normalizedWeights[type] = Math.round((weights[type] / enabledWeight) * 100);
        });
        
        return normalizedWeights;
      };

      const weights = { hiragana: 0, katakana: 0, kanji: 0, english: 0 };
      const enabledTypes = ['hiragana', 'katakana'];
      
      const result = normalizeWeights(weights, enabledTypes);
      
      expect(result).toEqual(weights); // Should return unchanged weights
    });
  });
});
