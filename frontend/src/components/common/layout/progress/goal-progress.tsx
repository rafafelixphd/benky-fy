'use client';

import { CheckCircle } from 'lucide-react';
import { ProgressBar } from './progress-bar';

interface GoalProgressProps {
  label: string;
  current?: number;
  total?: number;
  isDone?: boolean;
  showProgress?: boolean;
}

export function GoalProgress({
  label,
  current,
  total,
  isDone = false,
  showProgress = false,
}: GoalProgressProps) {
  const progress = total ? (current! / total) * 100 : 0;

  return (
     <div className="flex items-center justify-between">
       <div className="flex items-center gap-2">
          {isDone ? (
           <CheckCircle className="w-5 h-5 text-success" />
         ) : (
           <div className="w-5 h-5 rounded-full border-2 border-muted" />
         )}
         <span className="text-card-foreground">{label}</span>
       </div>
       {showProgress && (
         <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {current}/{total}
            </span>
           <div className="w-20">
             <ProgressBar progress={progress} />
           </div>
         </div>
        )}
      </div>
  );
}