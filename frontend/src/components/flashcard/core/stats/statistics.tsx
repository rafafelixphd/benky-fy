'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, BarChart3, TrendingUp, Clock, Target } from "lucide-react";

interface StatisticsProps {
  moduleName: string;
  onClose: () => void;
}

interface StatsData {
  totalCards: number;
  completedCards: number;
  correctAnswers: number;
  totalAnswers: number;
  averageTime: number;
  streak: number;
  accuracy: number;
}

export function Statistics({ moduleName, onClose }: StatisticsProps) {
  const [stats, setStats] = useState<StatsData>({
    totalCards: 0,
    completedCards: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    averageTime: 0,
    streak: 0,
    accuracy: 0,
  });

  useEffect(() => {
    // Load statistics from localStorage or API
    const loadStats = () => {
      const savedStats = localStorage.getItem(`benky-fy-stats-${moduleName}`);
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    };

    loadStats();
  }, [moduleName]);

  const accuracy =
    stats.totalAnswers > 0
      ? (stats.correctAnswers / stats.totalAnswers) * 100
      : 0;
  const completion =
    stats.totalCards > 0 ? (stats.completedCards / stats.totalCards) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto border border-border">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Statistics</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {stats.totalCards}
              </div>
              <div className="text-sm text-muted-foreground">Total Cards</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {stats.completedCards}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Completion</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(completion)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Accuracy</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(accuracy)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${accuracy}%` }}
                />
              </div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Correct Answers</span>
              </div>
              <span className="font-medium">{stats.correctAnswers}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Current Streak</span>
              </div>
              <span className="font-medium">{stats.streak}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Avg. Time per Card</span>
              </div>
              <span className="font-medium">{stats.averageTime}s</span>
            </div>
          </div>

          {/* Module Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Module Information</h4>
            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Module:</strong>{" "}
                {moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}
              </p>
              <p>
                <strong>Started:</strong> {new Date().toLocaleDateString()}
              </p>
              <p>
                <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t">
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
