'use client';

import Link from "next/link";
import { Menu } from "lucide-react";
import { MobileNavigationProps } from "./types";

export function MobileNavigation({ items, currentPath, onMoreClick }: MobileNavigationProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-primary-purple/10 shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {items.slice(0, 4).map((item) => {
          const IconComponent = item.icon;
          const isActive = currentPath === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] rounded-lg px-2 py-1 transition-all duration-200 ${
                isActive
                  ? "text-primary-purple"
                  : "text-foreground/60 hover:text-primary-purple"
              }`}
            >
              <IconComponent className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}

        <button
          onClick={onMoreClick}
          className="flex flex-col items-center justify-center min-w-[64px] min-h-[44px] rounded-lg px-2 py-1 text-foreground/60 hover:text-primary-purple transition-all duration-200"
        >
          <Menu className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">More</span>
        </button>
      </div>
    </nav>
  );
}
