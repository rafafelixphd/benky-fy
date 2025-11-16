import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CustomFlashcardPage from '../../../../app/flashcards/custom/page';

// Mock the auth hook
jest.mock('@/core/hooks', () => ({
  useAuth: () => ({
    data: {
      user: {
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
      },
    },
  }),
}));

// Mock the auth guard
jest.mock('@/components/common/auth', () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock the user menu
jest.mock('@/components/common/layout/navigation/user-menu', () => ({
  UserMenu: ({ user }: { user: any }) => <div data-testid="user-menu">{user.name}</div>,
}));

// Mock the floating elements
jest.mock('@/components/common/layout/background', () => ({
  FloatingElements: () => <div data-testid="floating-elements" />,
}));

describe('CustomFlashcardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page title and description', () => {
    render(<CustomFlashcardPage />);
    
    expect(screen.getByText('Custom Flashcards')).toBeInTheDocument();
    expect(screen.getByText('Personalized learning experience')).toBeInTheDocument();
  });

  it('renders configuration status section', () => {
    render(<CustomFlashcardPage />);
    
    expect(screen.getByText('Configuration Status')).toBeInTheDocument();
    expect(screen.getByText('Configure your custom flashcards')).toBeInTheDocument();
  });

  it('shows configure button when no settings are saved', () => {
    render(<CustomFlashcardPage />);
    
    expect(screen.getByRole('button', { name: /configure/i })).toBeInTheDocument();
  });

  it('opens settings modal when configure button is clicked', () => {
    render(<CustomFlashcardPage />);
    
    const configureButton = screen.getByRole('button', { name: /configure/i });
    fireEvent.click(configureButton);
    
    expect(screen.getByText('Custom Flashcard Settings')).toBeInTheDocument();
  });

  it('renders quick action cards', () => {
    render(<CustomFlashcardPage />);
    
    expect(screen.getByText('Customize')).toBeInTheDocument();
    expect(screen.getByText('Practice')).toBeInTheDocument();
    expect(screen.getByText('Track Progress')).toBeInTheDocument();
  });

  it('shows disabled start session button when no settings', () => {
    render(<CustomFlashcardPage />);
    
    const startButton = screen.getByRole('button', { name: /start session/i });
    expect(startButton).toBeDisabled();
  });

  it('renders user menu', () => {
    render(<CustomFlashcardPage />);
    
    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('renders floating elements', () => {
    render(<CustomFlashcardPage />);
    
    expect(screen.getByTestId('floating-elements')).toBeInTheDocument();
  });

  it('shows configuration preview when settings are saved', () => {
    render(<CustomFlashcardPage />);
    
    // Open settings modal
    const configureButton = screen.getByRole('button', { name: /configure/i });
    fireEvent.click(configureButton);
    
    // Save settings
    const saveButton = screen.getByRole('button', { name: /save configuration/i });
    fireEvent.click(saveButton);
    
    // Check that configuration status shows enabled types
    expect(screen.getByText('Word Types')).toBeInTheDocument();
    expect(screen.getByText('Display Modes')).toBeInTheDocument();
    expect(screen.getByText('Input Modes')).toBeInTheDocument();
  });

  it('enables start session button when settings are saved', () => {
    render(<CustomFlashcardPage />);
    
    // Open settings modal
    const configureButton = screen.getByRole('button', { name: /configure/i });
    fireEvent.click(configureButton);
    
    // Save settings
    const saveButton = screen.getByRole('button', { name: /save configuration/i });
    fireEvent.click(saveButton);
    
    // Check that start session button is enabled
    const startButton = screen.getByRole('button', { name: /start session/i });
    expect(startButton).not.toBeDisabled();
  });
});
