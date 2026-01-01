"use client";

import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/common/auth/auth-guard";
import { UserMenu } from "@/components/common/layout/navigation/user-menu";
import { useAuth } from "@/lib/hooks/hooks";
import { FloatingElements } from "@/components/common/layout/background";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Brain,
  Target,
  Trophy,
  Activity,
  Zap,
  Eye,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/common/layout/progress/progress-bar";
import { StatCard } from "@/components/common/layout/stats/stat-card";
import { GoalProgress } from "@/components/common/layout/progress/goal-progress";
import { dashboardApiClient, DashboardStats } from "@/api/private/dashboard/client";
import { getStatsConfig, recentModules } from "@/entities/dashboard";
import { NavigationHeader } from "@/components/common/layout/navigation/navigation-header";

export default function DashboardPage() {
  const { data: authData } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardApiClient.getStats();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    if (authData?.user) {
        fetchStats();
    }
  }, [authData]);

  // Transform API stats to display config
  const displayStats = stats ? [
    {
      label: "Total Words",
      value: stats.total_words_known.toString(),
      icon: BookOpen,
      color: "bg-blue-500",
    },
    {
      label: "Mastered",
      value: stats.mastered_words.toString(),
      icon: Trophy,
      color: "bg-yellow-500",
    },
    {
      label: "Learning",
      value: stats.on_the_way_words.toString(),
      icon: Brain,
      color: "bg-purple-500",
    },
    {
      label: "Accuracy",
      value: stats.total_attempts > 0 ? Math.round((stats.attempts_positive / stats.total_attempts) * 100) + "%" : "0%",
      icon: Target,
      color: "bg-green-500",
    },
  ] : [];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-primary-purple to-secondary-purple relative overflow-hidden">
        <FloatingElements />

        <NavigationHeader />

      <div className="relative z-10 pt-24 px-6 pb-6 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-white/80 text-lg">Track your progress</p>
      </div>

        {/* Main Content */}
        <div className="relative z-10 px-6 pb-6">
          <div className="max-w-6xl mx-auto">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {loading ? (
                 // Simple skeletons
                 Array(4).fill(0).map((_, i) => (
                    <Card key={i} className="h-32 animate-pulse bg-white/5 p-6">
                        <div className="h-full w-full bg-white/10 rounded"></div>
                    </Card>
                 ))
              ) : (
                  displayStats.map((stat) => (
                    <StatCard
                      key={stat.label}
                      label={stat.label}
                      value={stat.value}
                      icon={stat.icon}
                      color={stat.color}
                    />
                  ))
              )}
            </div>
            
            {!loading && stats && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Activity Overview */}
                    <Card className="p-6 bg-black/20 backdrop-blur-md border-white/10 text-white">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-400" />
                            Activity Overview
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-white/70">Total Attempts</span>
                                <span className="text-xl font-bold">{stats.total_attempts}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-white/70">Correct Answers</span>
                                <span className="text-xl font-bold text-green-400">{stats.attempts_positive}</span>
                            </div>
                             <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-white/70">Needs Practice</span>
                                <span className="text-xl font-bold text-red-400">{stats.attempts_negative}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Top lists container */}
                    <div className="space-y-6">
                        {/* Hardest Words */}
                        <Card className="p-6 bg-black/20 backdrop-blur-md border-white/10 text-white">
                             <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                                Top Hardest Words
                            </h3>
                             <div className="grid grid-cols-2 gap-2">
                                {stats.top_hardest_words.map(w => (
                                    <div key={w.id} className="bg-white/5 p-2 rounded flex justify-between items-center">
                                        <div>
                                            <div className="font-bold">{w.surface}</div>
                                             {w.reading?.kana && <div className="text-xs text-white/60">{w.reading.kana}</div>}
                                        </div>
                                         <div className="text-red-400 font-bold text-sm">{(w.accuracy * 100).toFixed(0)}%</div>
                                    </div>
                                ))}
                                {stats.top_hardest_words.length === 0 && <div className="text-white/50 text-sm">No data yet. Keep studying!</div>}
                             </div>
                        </Card>
                         {/* Most Viewed Words */}
                        <Card className="p-6 bg-black/20 backdrop-blur-md border-white/10 text-white">
                             <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Eye className="w-5 h-5 text-purple-400" />
                                Most Viewed Words
                            </h3>
                             <div className="grid grid-cols-2 gap-2">
                                {stats.top_viewed_words.map(w => (
                                    <div key={w.id} className="bg-white/5 p-2 rounded flex justify-between items-center">
                                        <div>
                                            <div className="font-bold">{w.surface}</div>
                                            {w.reading?.kana && <div className="text-xs text-white/60">{w.reading.kana}</div>}
                                        </div>
                                         <div className="text-blue-400 font-bold text-sm">{w.views}</div>
                                    </div>
                                ))}
                                {stats.top_viewed_words.length === 0 && <div className="text-white/50 text-sm">No data yet.</div>}
                             </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}