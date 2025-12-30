"use client";

import { ReactNode } from "react";
import {
  cardStyles,
  layoutStyles,
  interactionStyles,
} from "@/styles/components";

interface CardProps {
  children: ReactNode;
  variant?: keyof typeof cardStyles;
  interactive?: boolean;
  elevated?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Card({
  children,
  variant = "primary",
  interactive = false,
  elevated = false,
  className = "",
  onClick,
}: CardProps): JSX.Element {
  const baseStyles = [
    cardStyles.base,
    cardStyles[variant],
    elevated && cardStyles.elevated,
    interactive && cardStyles.interactive,
    interactive && interactionStyles.focus.ring,
    layoutStyles.padding.md,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`${baseStyles} ${className}`}
      onClick={interactive ? onClick : undefined}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {children}
    </div>
  );
}

interface CardGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: keyof typeof layoutStyles.gap;
  className?: string;
}

export function CardGrid({
  children,
  columns = 2,
  gap = "md",
  className = "",
}: CardGridProps): JSX.Element {
  const gridStyles = [
    layoutStyles.grid.base,
    layoutStyles.grid[`cols${columns}` as keyof typeof layoutStyles.grid],
    layoutStyles.gap[gap],
  ].join(" ");

  return <div className={`${gridStyles} ${className}`}>{children}</div>;
}
