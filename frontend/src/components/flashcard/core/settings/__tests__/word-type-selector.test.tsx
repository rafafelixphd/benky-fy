import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WordTypeSelector } from '../word-type-selector';

describe('WordTypeSelector', () => {
  const defaultProps = {
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
    onWordTypeChange: jest.fn(),
    onWeightChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders word type checkboxes correctly', () => {
    render(<WordTypeSelector {...defaultProps} />);
    
    expect(screen.getByLabelText('hiragana')).toBeChecked();
    expect(screen.getByLabelText('katakana')).toBeChecked();
    expect(screen.getByLabelText('kanji')).not.toBeChecked();
    expect(screen.getByLabelText('english')).toBeChecked();
  });

  it('calls onWordTypeChange when checkbox is clicked', () => {
    render(<WordTypeSelector {...defaultProps} />);
    
    const kanjiCheckbox = screen.getByLabelText('kanji');
    fireEvent.click(kanjiCheckbox);
    
    expect(defaultProps.onWordTypeChange).toHaveBeenCalledWith('kanji', true);
  });

  it('shows weight distribution when multiple types are enabled', () => {
    render(<WordTypeSelector {...defaultProps} />);
    
    expect(screen.getByText('Weight Distribution')).toBeInTheDocument();
    expect(screen.getByText('Total: 100%')).toBeInTheDocument();
  });

  it('calls onWeightChange when slider is moved', () => {
    render(<WordTypeSelector {...defaultProps} />);
    
    const hiraganaSlider = screen.getByDisplayValue('40');
    fireEvent.change(hiraganaSlider, { target: { value: '50' } });
    
    expect(defaultProps.onWeightChange).toHaveBeenCalledWith('hiragana', 50);
  });

  it('shows weight visualization bars', () => {
    render(<WordTypeSelector {...defaultProps} />);
    
    const visualization = screen.getByRole('generic', { name: /weight visualization/i });
    expect(visualization).toBeInTheDocument();
  });

  it('displays correct weight percentages', () => {
    render(<WordTypeSelector {...defaultProps} />);
    
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('hides weight distribution when only one type is enabled', () => {
    const singleTypeProps = {
      ...defaultProps,
      wordTypes: {
        hiragana: true,
        katakana: false,
        kanji: false,
        english: false,
      },
    };
    
    render(<WordTypeSelector {...singleTypeProps} />);
    
    expect(screen.queryByText('Weight Distribution')).not.toBeInTheDocument();
  });

  it('shows tip information', () => {
    render(<WordTypeSelector {...defaultProps} />);
    
    expect(screen.getByText(/Weights determine how often each word type appears/)).toBeInTheDocument();
  });
});
