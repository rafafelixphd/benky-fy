export interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export interface AuthLoadingProps {
  message?: string;
}

export interface AuthErrorProps {
  message?: string;
  onRetry?: () => void;
}

export interface AuthRedirectProps {
  message?: string;
}

export interface AuthUserData {
  name: string;
  email: string;
  picture?: string;
  provider?: string;
}

export interface AuthUserMenuProps {
  user: AuthUserData;
  onLogout?: () => void;
}

export interface LoginButtonProps {
  provider: 'google' | 'github';
  onLogin?: () => void;
  className?: string;
}
