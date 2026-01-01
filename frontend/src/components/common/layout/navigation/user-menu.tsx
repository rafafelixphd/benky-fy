'use client';

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, Settings, BarChart3, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/utils";

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
  const [imageError, setImageError] = useState(false);
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

  const UserAvatar = () => {
    if (user.picture && !imageError) {
      return (
        <img
          src={user.picture}
          alt={user.name || 'User'}
          className="w-8 h-8 rounded-full border border-border object-cover"
          onError={() => setImageError(true)}
        />
      );
    }

    return (
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
        <User className="w-4 h-4 text-primary" />
      </div>
    );
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={cn(
          "flex items-center gap-2 p-1.5 rounded-full pl-2 pr-3 transition-colors border border-transparent",
          isMenuOpen ? "bg-accent border-border" : "hover:bg-accent/50"
        )}
        aria-expanded={isMenuOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <UserAvatar />
        <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate">
          {user.name || 'User'}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", isMenuOpen && "rotate-180")} />
      </button>

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-64 rounded-xl bg-popover text-popover-foreground shadow-xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 z-50 overflow-hidden"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="p-4 border-b border-border bg-muted/30">
            <p className="text-sm font-semibold truncate">
              {user.name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">
              {user.email || 'No email provided'}
            </p>
          </div>

          <div className="p-2 space-y-1">
            {onProfileClick ? (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onProfileClick();
                }}
                className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
                role="menuitem"
              >
                <User className="w-4 h-4 text-primary" />
                Your Profile
              </button>
            ) : (
              <Link
                href="/profile"
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
                role="menuitem"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="w-4 h-4 text-primary" />
                Your Profile
              </Link>
            )}
            
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
              role="menuitem"
              onClick={() => setIsMenuOpen(false)}
            >
              <BarChart3 className="w-4 h-4 text-blue-500" />
              Dashboard
            </Link>
          </div>

          <div className="p-2 border-t border-border mt-1">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={cn(
                "w-full text-left flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20",
                isLoggingOut && "opacity-50 cursor-not-allowed"
              )}
              role="menuitem"
            >
              <LogOut className={cn("w-4 h-4", isLoggingOut && "animate-spin")} />
              {isLoggingOut ? "Logging out..." : "Log out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}