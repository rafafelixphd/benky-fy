'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { ErrorContextValue } from './types';

const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const [lastError, setLastError] = useState<Error>();

  const handleError = useCallback((error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Error caught by ErrorContext:', error, errorInfo);
    setLastError(error);
    // You could also send this to an error reporting service
  }, []);

  const clearError = useCallback(() => {
    setLastError(undefined);
  }, []);

  return (
    <ErrorContext.Provider value={{ handleError, clearError, lastError }}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}

export function useErrorHandler() {
  const { handleError } = useError();
  return handleError;
}
