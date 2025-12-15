'use client';

import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { AuthUserMenuProps } from "./types";

export function AuthUserMenu({
  user,
  onLogout = () => window.location.href = "/auth/logout",
}: AuthUserMenuProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <User className="w-8 h-8 text-muted-foreground" />
        )}
        <span className="text-sm font-medium">{user.name}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onLogout}
        className="flex items-center gap-2 border-primary-purple/30 text-primary-purple hover:bg-primary-purple/10"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
    </div>
  );
}
