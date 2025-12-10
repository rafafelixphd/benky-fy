'use client';

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, Settings, BarChart3 } from "lucide-react";

interface UserMenuProps {
  user?: {
    name?: string;
    email?: string;
    picture?: string;
  };
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
}

export function UserMenu({ user, onProfileClick, onSettingsClick }: UserMenuProps) {
  if (!user) return null;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setIsMenuOpen(false);
    window.location.href = "/auth/logout";
  };

  return (
    <div className="relative z-50">
      <button
        ref={buttonRef}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors"
        aria-expanded={isMenuOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name || 'User'}
            className="w-8 h-8 rounded-full border-2 border-primary-foreground/20"
            onError={(e) => {
              // Fallback to user icon if image fails to load
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const fallback = document.createElement('div');
                fallback.className = "w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center";
                const icon = document.createElement('div');
                icon.className = "w-5 h-5 text-primary-foreground";
                icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                fallback.appendChild(icon);
                parent.appendChild(fallback);
              }
            }}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
        <span className="text-sm font-medium text-primary-foreground hidden sm:block">
          {user.name || 'User'}
        </span>
      </button>

      {isMenuOpen && (
        <>
          {/* Invisible overlay to handle clicks outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu dropdown */}
          <div
            ref={menuRef}
            className="absolute right-0 mt-2 w-48 rounded-lg bg-background/95 backdrop-blur-sm border border-primary-foreground/20 shadow-lg py-2 z-50"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu"
          >
            <div className="px-4 py-2 border-b border-primary-foreground/10">
              <p className="text-sm font-medium text-primary-foreground">
                {user.name || 'User'}
              </p>
              <p className="text-xs text-primary-foreground/70 truncate">
                {user.email || 'No email provided'}
              </p>
            </div>

            <nav className="py-1">
              {onProfileClick ? (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onProfileClick();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-primary-foreground hover:bg-primary-foreground/10"
                  role="menuitem"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profile
                  </span>
                </button>
              ) : (
                <Link
                  href="/profile"
                  className="block w-full text-left px-4 py-2 text-sm text-primary-foreground hover:bg-primary-foreground/10"
                  role="menuitem"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profile
                  </span>
                </Link>
              )}
              <Link
                href="/stats"
                className="block w-full text-left px-4 py-2 text-sm text-primary-foreground hover:bg-primary-foreground/10"
                role="menuitem"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Statistics
                </span>
              </Link>
              {onSettingsClick ? (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onSettingsClick();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-primary-foreground hover:bg-primary-foreground/10"
                  role="menuitem"
                >
                  <span className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </span>
                </button>
              ) : (
                <Link
                  href="/settings"
                  className="block w-full text-left px-4 py-2 text-sm text-primary-foreground hover:bg-primary-foreground/10"
                  role="menuitem"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </span>
                </Link>
              )}
            </nav>

            <div className="pt-1 mt-1 border-t border-primary-foreground/10">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  isLoggingOut
                    ? "text-red-300 cursor-not-allowed"
                    : "text-red-500 hover:bg-red-500/10"
                }`}
                role="menuitem"
              >
                <span className="flex items-center gap-2">
                  <LogOut
                    className={`w-4 h-4 ${isLoggingOut ? "animate-spin" : ""}`}
                  />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}