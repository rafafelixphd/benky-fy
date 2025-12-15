import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InputConfig } from '../input-config';

describe('InputConfig', () => {
  const defaultProps = {
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
    onInputModeChange: jest.fn(),
    onModeWeightChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input mode checkboxes correctly', () => {
    render(<InputConfig {...defaultProps} />);
    
    expect(screen.getByLabelText(/Hiragana \(ひらがな\)/)).toBeChecked();
    expect(screen.getByLabelText(/Katakana \(カタカナ\)/)).toBeChecked();
    expect(screen.getByLabelText(/Kanji \(漢字\)/)).not.toBeChecked();
    expect(screen.getByLabelText(/Romaji \(romanized\)/)).toBeChecked();
    expect(screen.getByLabelText(/English/)).toBeChecked();
  });

  it('calls onInputModeChange when checkbox is clicked', () => {
    render(<InputConfig {...defaultProps} />);
    
    const kanjiCheckbox = screen.getByLabelText(/Kanji \(漢字\)/);
    fireEvent.click(kanjiCheckbox);
    
    expect(defaultProps.onInputModeChange).toHaveBeenCalledWith('kanji', true);
  });

  it('shows input mode descriptions', () => {
    render(<InputConfig {...defaultProps} />);
    
    expect(screen.getByText('Type hiragana characters directly')).toBeInTheDocument();
    expect(screen.getByText('Type katakana characters directly')).toBeInTheDocument();
    expect(screen.getByText('Type kanji characters directly')).toBeInTheDocument();
    expect(screen.getByText('Type romanized Japanese (converts to kana)')).toBeInTheDocument();
    expect(screen.getByText('Type English translations')).toBeInTheDocument();
  });

  it('shows input mode distribution when multiple modes are enabled', () => {
    render(<InputConfig {...defaultProps} />);
    
    expect(screen.getByText('Input Mode Distribution')).toBeInTheDocument();
    expect(screen.getByText('Total: 100%')).toBeInTheDocument();
  });

  it('calls onModeWeightChange when slider is moved', () => {
    render(<InputConfig {...defaultProps} />);
    
    const hiraganaSlider = screen.getByDisplayValue('25');
    fireEvent.change(hiraganaSlider, { target: { value: '30' } });
    
    expect(defaultProps.onModeWeightChange).toHaveBeenCalledWith('hiragana', 30);
  });

  it('shows input mode visualization bars', () => {
    render(<InputConfig {...defaultProps} />);
    
    const visualization = screen.getByRole('generic', { name: /input mode visualization/i });
    expect(visualization).toBeInTheDocument();
  });

  it('displays correct mode percentages', () => {
    render(<InputConfig {...defaultProps} />);
    
    // Check for percentage displays in the weight distribution section
    const percentageElements = screen.getAllByText('25%');
    expect(percentageElements.length).toBeGreaterThanOrEqual(4); // At least 4 enabled modes
  });

  it('shows input preview section with enabled modes', () => {
    render(<InputConfig {...defaultProps} />);
    
    expect(screen.getByText('Input Preview')).toBeInTheDocument();
    expect(screen.getAllByText('Hiragana (ひらがな)').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Katakana (カタカナ)').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Romaji (romanized)').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('English').length).toBeGreaterThanOrEqual(1);
  });

  it('shows input examples when modes are enabled', () => {
    render(<InputConfig {...defaultProps} />);
    
    expect(screen.getByText('Input Examples:')).toBeInTheDocument();
    expect(screen.getByText('Hiragana (ひらがな): こんにちは')).toBeInTheDocument();
    expect(screen.getByText('Katakana (カタカナ): コンニチハ')).toBeInTheDocument();
    expect(screen.getByText('Romaji (romanized): konnichiwa')).toBeInTheDocument();
    expect(screen.getByText('English: hello')).toBeInTheDocument();
  });

  it('shows tip information', () => {
    render(<InputConfig {...defaultProps} />);
    
    expect(screen.getByText(/Input modes determine how users can answer flashcards/)).toBeInTheDocument();
  });

  it('hides mode distribution when only one mode is enabled', () => {
    const singleModeProps = {
      ...defaultProps,
      inputModes: {
        hiragana: true,
        katakana: false,
        kanji: false,
        romaji: false,
        english: false,
      },
    };
    
    render(<InputConfig {...singleModeProps} />);
    
    expect(screen.queryByText('Input Mode Distribution')).not.toBeInTheDocument();
  });

  it('shows no input examples when no modes are enabled', () => {
    const noModesProps = {
      ...defaultProps,
      inputModes: {
        hiragana: false,
        katakana: false,
        kanji: false,
        romaji: false,
        english: false,
      },
    };
    
    render(<InputConfig {...noModesProps} />);
    
    expect(screen.queryByText('Input Examples:')).not.toBeInTheDocument();
  });
});
