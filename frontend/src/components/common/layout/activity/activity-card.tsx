'use client';

import { Card } from '@/components/ui/card';

interface Activity {
  module: string;
  action: string;
  time: string;
  accuracy: number;
}

interface ActivityCardProps {
  title: string;
  activities: Activity[];
}

export function ActivityCard({ title, activities }: ActivityCardProps) {
  return (
    <Card>
      <h3 className="text-xl font-semibold text-card-foreground mb-4">
        {title}
      </h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-3 bg-card-foreground/5 hover:bg-card-foreground/10 rounded-lg transition-colors"
          >
            <div>
              <div className="font-medium text-card-foreground">
                {activity.module}
              </div>
              <div className="text-sm text-muted-foreground">
                {activity.action}
              </div>
              <div className="text-xs text-muted-foreground/80">
                {activity.time}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-success">
                {activity.accuracy}%
              </div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}