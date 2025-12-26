'use client';

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileMenuProps } from "./types";

export function MobileMenu({
  items,
  trigger,
  className = "",
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(0);

  // Update menu position when opened
  useEffect(() => {
    if (isOpen) {
      const menuTrigger = document.getElementById("mobile-menu");
      if (menuTrigger) {
        const rect = menuTrigger.getBoundingClientRect();
        setMenuPosition(rect.bottom + window.scrollY);
      }
    }
  }, [isOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menu = document.getElementById("mobile-menu");
      if (menu && !menu.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" id="mobile-menu">
      {trigger ? (
        <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          className={className}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      )}

      <div
        style={{
          zIndex: 9999,
          position: "fixed",
          top: menuPosition,
          right: "1rem",
        }}
        className={`w-48 rounded-lg shadow-lg bg-background/95 backdrop-blur-md border border-primary-purple/10 transition-all duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-[10px] pointer-events-none"
        }`}
      >
        <div className="py-1">
          {items.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  item.onClick();
                }}
                className="w-full text-left px-4 py-2 text-sm text-foreground/80 hover:text-primary-purple hover:bg-accent/50 flex items-center gap-2"
              >
                <IconComponent className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
