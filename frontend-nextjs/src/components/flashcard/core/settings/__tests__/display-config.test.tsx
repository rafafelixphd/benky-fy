import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DisplayConfig } from '../display-config';

describe('DisplayConfig', () => {
  const defaultProps = {
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
    onDisplayModeChange: jest.fn(),
    onModeWeightChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders display mode checkboxes correctly', () => {
    render(<DisplayConfig {...defaultProps} />);
    
    expect(screen.getByLabelText(/Kana \(ひらがな\/カタカナ\)/)).toBeChecked();
    expect(screen.getByLabelText(/Kanji \(漢字\)/)).not.toBeChecked();
    expect(screen.getByLabelText(/Kanji \+ Furigana \(漢字\+ふりがな\)/)).not.toBeChecked();
    expect(screen.getByLabelText(/English/)).toBeChecked();
  });

  it('calls onDisplayModeChange when checkbox is clicked', () => {
    render(<DisplayConfig {...defaultProps} />);
    
    const kanjiCheckbox = screen.getByLabelText(/Kanji \(漢字\)/);
    fireEvent.click(kanjiCheckbox);
    
    expect(defaultProps.onDisplayModeChange).toHaveBeenCalledWith('kanji', true);
  });

  it('shows mode descriptions', () => {
    render(<DisplayConfig {...defaultProps} />);
    
    expect(screen.getByText('Shows hiragana or katakana characters')).toBeInTheDocument();
    expect(screen.getByText('Shows kanji characters only')).toBeInTheDocument();
    expect(screen.getByText('Shows kanji with reading assistance')).toBeInTheDocument();
    expect(screen.getByText('Shows English translation')).toBeInTheDocument();
  });

  it('shows mode distribution when multiple modes are enabled', () => {
    render(<DisplayConfig {...defaultProps} />);
    
    expect(screen.getByText('Mode Distribution')).toBeInTheDocument();
    expect(screen.getByText('Total: 100%')).toBeInTheDocument();
  });

  it('calls onModeWeightChange when slider is moved', () => {
    render(<DisplayConfig {...defaultProps} />);
    
    const kanaSlider = screen.getByDisplayValue('70');
    fireEvent.change(kanaSlider, { target: { value: '80' } });
    
    expect(defaultProps.onModeWeightChange).toHaveBeenCalledWith('kana', 80);
  });

  it('shows mode visualization bars', () => {
    render(<DisplayConfig {...defaultProps} />);
    
    const visualization = screen.getByRole('generic', { name: /mode visualization/i });
    expect(visualization).toBeInTheDocument();
  });

  it('displays correct mode percentages', () => {
    render(<DisplayConfig {...defaultProps} />);
    
    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('shows preview section with enabled modes', () => {
    render(<DisplayConfig {...defaultProps} />);
    
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Kana (ひらがな/カタカナ)')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('shows tip information', () => {
    render(<DisplayConfig {...defaultProps} />);
    
    expect(screen.getByText(/Display modes determine how flashcards are shown/)).toBeInTheDocument();
  });

  it('hides mode distribution when only one mode is enabled', () => {
    const singleModeProps = {
      ...defaultProps,
      displayModes: {
        kana: true,
        kanji: false,
        kanji_furigana: false,
        english: false,
      },
    };
    
    render(<DisplayConfig {...singleModeProps} />);
    
    expect(screen.queryByText('Mode Distribution')).not.toBeInTheDocument();
  });
});
