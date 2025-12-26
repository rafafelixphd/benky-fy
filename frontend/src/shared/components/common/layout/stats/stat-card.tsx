'use client';

import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: StatCardProps) {
  return (
    <Card className="bg-card hover:bg-card/90 transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${color} bg-card-foreground/10`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-xl font-semibold text-card-foreground">
            {value}
          </div>
        </div>
      </div>
    </Card>
  );
}