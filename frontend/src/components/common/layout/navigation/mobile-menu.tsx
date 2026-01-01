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

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
          className={className}
        >
          <Menu className="w-5 h-5" />
        </Button>
      )}

      {/* Overlay/Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 animate-in fade-in-0"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-over Menu */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-3/4 sm:max-w-sm bg-background p-6 shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Menu</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex flex-col gap-2">
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
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                >
                  <IconComponent className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
