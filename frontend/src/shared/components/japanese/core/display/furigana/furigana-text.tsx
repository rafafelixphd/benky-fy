'use client';

import { useState } from "react";
import { FuriganaProps } from "@/components/japanese/types/display";

const sizeClasses = {
  sm: {
    text: "text-lg",
    reading: "text-sm",
    gap: "gap-0.5",
  },
  md: {
    text: "text-2xl",
    reading: "text-base",
    gap: "gap-1",
  },
  lg: {
    text: "text-4xl",
    reading: "text-xl",
    gap: "gap-1.5",
  },
  xl: {
    text: "text-6xl",
    reading: "text-2xl",
    gap: "gap-2",
  },
};

const styleClasses = {
  modern: {
    container: "font-sans",
    text: "font-medium",
    reading: "font-normal",
  },
  traditional: {
    container: "font-serif",
    text: "font-semibold",
    reading: "font-medium",
  },
};

export function FuriganaText({
  text,
  reading,
  size = "md",
  className = "",
  showReading = true,
  position = "top",
  style = "modern",
  hoverToShow = false,
}: FuriganaProps) {
  const [isHovered, setIsHovered] = useState(false);
  const sizeClass = sizeClasses[size];
  const styleClass = styleClasses[style];

  const shouldShowReading = hoverToShow ? isHovered : showReading;

  return (
    <div 
      className={`
        inline-flex flex-col ${sizeClass.gap} items-center
        ${styleClass.container} ${className}
        ${hoverToShow ? "cursor-pointer" : ""}
      `}
      style={{ flexDirection: position === "top" ? "column" : "column-reverse" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {reading && (
        <span 
          className={`
            ${sizeClass.reading} ${styleClass.reading}
            text-primary-foreground/70
            transition-opacity duration-200
            ${shouldShowReading ? "opacity-100" : "opacity-0 absolute"}
          `}
        >
          {reading}
        </span>
      )}
      <span className={`
        ${sizeClass.text} ${styleClass.text}
        text-primary-foreground
      `}>
        {text}
      </span>
    </div>
  );
}