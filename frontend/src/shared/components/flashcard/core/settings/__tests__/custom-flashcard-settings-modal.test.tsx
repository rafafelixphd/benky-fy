import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CustomFlashcardSettingsModal } from '../custom-flashcard-settings-modal';

describe('CustomFlashcardSettingsModal', () => {
  const defaultProps = {
    onClose: jest.fn(),
    onSave: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal with correct title', () => {
    render(<CustomFlashcardSettingsModal {...defaultProps} />);
    
    expect(screen.getByText('Custom Flashcard Settings')).toBeInTheDocument();
  });

  it('renders all three configuration sections', () => {
    render(<CustomFlashcardSettingsModal {...defaultProps} />);
    
    expect(screen.getByText('Word Type Selection')).toBeInTheDocument();
    expect(screen.getByText('Display Mode Configuration')).toBeInTheDocument();
    expect(screen.getByText('Input Mode Configuration')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<CustomFlashcardSettingsModal {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: '' }); // Close button has no accessible name
    fireEvent.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onSave when save button is clicked', async () => {
    render(<CustomFlashcardSettingsModal {...defaultProps} />);
    
    const saveButton = screen.getByRole('button', { name: /save configuration/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalled();
    });
  });

  it('calls onClose after successful save', async () => {
    defaultProps.onSave.mockResolvedValue(undefined);
    
    render(<CustomFlashcardSettingsModal {...defaultProps} />);
    
    const saveButton = screen.getByRole('button', { name: /save configuration/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('resets settings when reset button is clicked', () => {
    render(<CustomFlashcardSettingsModal {...defaultProps} />);
    
    // First, change a setting - use getAllByLabelText to handle duplicates
    const kanjiCheckboxes = screen.getAllByLabelText(/Kanji \(漢字\)/);
    const firstKanjiCheckbox = kanjiCheckboxes[0];
    fireEvent.click(firstKanjiCheckbox);
    
    // Then reset
    const resetButton = screen.getByRole('button', { name: /reset to defaults/i });
    fireEvent.click(resetButton);
    
    // Verify it's back to default (unchecked)
    expect(firstKanjiCheckbox).not.toBeChecked();
  });

  it('shows loading state when saving', async () => {
    defaultProps.onSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<CustomFlashcardSettingsModal {...defaultProps} />);
    
    const saveButton = screen.getByRole('button', { name: /save configuration/i });
    fireEvent.click(saveButton);
    
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  it('disables buttons during save operation', async () => {
    defaultProps.onSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<CustomFlashcardSettingsModal {...defaultProps} />);
    
    const saveButton = screen.getByRole('button', { name: /save configuration/i });
    const resetButton = screen.getByRole('button', { name: /reset to defaults/i });
    
    fireEvent.click(saveButton);
    
    expect(saveButton).toBeDisabled();
    expect(resetButton).toBeDisabled();
  });

  it('handles save errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    defaultProps.onSave.mockRejectedValue(new Error('Save failed'));
    
    render(<CustomFlashcardSettingsModal {...defaultProps} />);
    
    const saveButton = screen.getByRole('button', { name: /save configuration/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save custom flashcard settings:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  it('renders with default settings', () => {
    render(<CustomFlashcardSettingsModal {...defaultProps} />);
    
    // Check default word types
    expect(screen.getByLabelText('hiragana')).toBeChecked();
    expect(screen.getByLabelText('katakana')).toBeChecked();
    expect(screen.getByLabelText('kanji')).not.toBeChecked();
    expect(screen.getByLabelText('english')).toBeChecked();
    
    // Check default display modes - use getAllByLabelText to handle duplicates
    expect(screen.getByLabelText(/Kana \(ひらがな\/カタカナ\)/)).toBeChecked();
    const kanjiCheckboxes = screen.getAllByLabelText(/Kanji \(漢字\)/);
    expect(kanjiCheckboxes[0]).not.toBeChecked();
    expect(screen.getByLabelText(/English/)).toBeChecked();
    
    // Check default input modes
    expect(screen.getByLabelText(/Hiragana \(ひらがな\)/)).toBeChecked();
    expect(screen.getByLabelText(/Katakana \(カタカナ\)/)).toBeChecked();
    expect(screen.getByLabelText(/Romaji \(romanized\)/)).toBeChecked();
    expect(screen.getByLabelText(/English/)).toBeChecked();
  });
});
