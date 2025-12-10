'use client';

interface HintDisplayProps {
  text: string;
  type?: string;
  className?: string;
}

export function HintDisplay({
  text,
  type,
  className = 'text-2xl text-white/80'
}: HintDisplayProps) {
  return (
    <div className={className}>
      {type ? `${type} - ` : ''}{text}
    </div>
  );
}
