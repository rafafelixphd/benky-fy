'use client';

import Link from "next/link";
import { DesktopNavigationProps } from "./types";

export function DesktopNavigation({ items, currentPath }: DesktopNavigationProps) {
  return (
    <nav className="hidden md:flex items-center space-x-4">
      {items.map((item) => {
        const IconComponent = item.icon;
        const isActive = currentPath === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive
                ? "text-primary-purple bg-primary-purple/10 shadow-sm"
                : "text-foreground/80 hover:text-primary-purple hover:bg-accent/50"
            }`}
          >
            <IconComponent className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
