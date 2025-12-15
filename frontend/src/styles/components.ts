/**
 * Shared component styles using Tailwind CSS
 * These classes are used across multiple components to maintain consistency
 */

export const textStyles = {
  // Text colors and opacity variants
  primary: "text-white",
  secondary: "text-white/70",
  tertiary: "text-white/50",
  error: "text-red-500",

  // Text sizes with consistent scale
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
} as const;

export const layoutStyles = {
  // Flex layouts
  row: "flex flex-row",
  col: "flex flex-col",
  center: "items-center justify-center",
  between: "justify-between",
  gap: {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  },

  // Grid layouts
  grid: {
    base: "grid",
    cols1: "grid-cols-1",
    cols2: "md:grid-cols-2",
    cols3: "md:grid-cols-3",
    cols4: "md:grid-cols-4",
  },

  // Spacing
  padding: {
    sm: "p-2",
    md: "p-4",
    lg: "p-6",
  },
} as const;

export const interactionStyles = {
  // Hover effects
  hover: {
    opacity: "hover:bg-white/10",
    scale: "hover:scale-105 transition-transform",
    highlight: "hover:bg-white/20 transition-colors",
  },

  // Focus states
  focus: {
    ring: "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
    visible:
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
  },

  // Transitions
  transition: {
    base: "transition-all duration-200",
    fast: "transition-all duration-150",
    slow: "transition-all duration-300",
  },
} as const;

export const cardStyles = {
  // Base card styles
  base: "rounded-lg border-2 border-transparent",
  interactive: "cursor-pointer hover:bg-white/10 transition-colors",
  elevated: "bg-white/5 shadow-lg",

  // Card variations
  primary: "bg-white/5 hover:bg-white/10",
  secondary: "bg-black/20 hover:bg-black/30",
  bordered: "border-2 border-white/10",
} as const;

export const tooltipStyles = {
  // Base tooltip
  base: "absolute transform -translate-x-1/2 whitespace-nowrap",
  container: "relative inline-block group",

  // Positioning
  top: "-top-8 left-1/2",
  bottom: "-bottom-8 left-1/2",

  // Appearance
  content: "bg-black/80 text-white/90 px-2 py-1 rounded text-sm",

  // Animation
  animation:
    "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
} as const;

export const progressStyles = {
  // Progress bar
  bar: {
    container: "w-full bg-white/10 rounded-full",
    progress: "bg-blue-500 rounded-full transition-all duration-300",
  },

  // Progress indicators
  indicator: {
    success: "text-green-500",
    warning: "text-yellow-500",
    error: "text-red-500",
  },
} as const;

export const formStyles = {
  // Input fields
  input: {
    base: "px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20",
    focus: "focus:border-white/40 focus:outline-none",
    error: "border-red-500 focus:border-red-600",
  },

  // Buttons
  button: {
    base: "px-6 py-2 rounded-lg font-medium transition-colors",
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-white/10 text-white hover:bg-white/20",
    disabled: "opacity-50 cursor-not-allowed",
  },
} as const;
