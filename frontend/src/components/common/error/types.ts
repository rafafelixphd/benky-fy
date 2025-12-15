export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

export interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
}

export interface ErrorDisplayProps {
  title?: string;
  message?: string;
  error?: Error;
  showDetails?: boolean;
  actions?: ErrorAction[];
}

export interface ErrorAction {
  label: string;
  icon?: React.ElementType;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export interface ErrorContextValue {
  handleError: (error: Error, errorInfo?: React.ErrorInfo) => void;
  clearError: () => void;
  lastError?: Error;
}
