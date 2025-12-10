import { LucideIcon } from "lucide-react";

export interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavigationHeaderProps {
  currentPage?: string;
  showUserMenu?: boolean;
}

export interface MobileMenuProps {
  items: {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
  }[];
  trigger?: React.ReactNode;
  className?: string;
}

export interface DesktopNavigationProps {
  items: NavigationItem[];
  currentPath: string;
}

export interface MobileNavigationProps {
  items: NavigationItem[];
  currentPath: string;
  onMoreClick: () => void;
}

export interface UserMenuProps {
  onProfileClick: () => void;
  onSettingsClick: () => void;
}
