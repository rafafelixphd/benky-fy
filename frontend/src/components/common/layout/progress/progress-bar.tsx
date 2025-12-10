'use client';

interface ProgressBarProps {
  progress: number;
  showPercentage?: boolean;
  className?: string;
}

export function ProgressBar({
  progress,
  showPercentage = false,
  className = '',
}: ProgressBarProps) {
  return (
     <div className={`space-y-1 ${className}`}>
       <div className="h-2 bg-muted rounded-full overflow-hidden">
         <div
           className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
           style={{ width: `${progress}%` }}
         />
       </div>
       {showPercentage && (
         <div className="text-xs text-muted-foreground">
           {Math.round(progress)}%
         </div>
       )}
      </div>
  );
}