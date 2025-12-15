"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/common/auth/auth-guard";
import { UserMenu } from "@/components/common/layout/navigation/user-menu";
import { useAuth } from "@/core/hooks";
import { FloatingElements } from "@/components/common/layout/background/floating-elements";
import { RomajiInput } from "@/components/japanese/core/input/romaji";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Brain,
  Target,
  TrendingUp,
  Clock,
  Award,
  Search,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/common/layout/progress/progress-bar";
import { StatCard } from "@/components/common/layout/stats/stat-card";
import { ActivityCard } from "@/components/common/layout/activity/activity-card";
import { GoalProgress } from "@/components/common/layout/progress/goal-progress";

const dashboardData = {
  todayStats: {
    studyTime: "2 hours 30 minutes",
    cardsReviewed: 45,
    accuracy: 87,
    streakDays: 12,
  },
  recentActivity: [
    {
      module: "Hiragana",
      action: "Completed 20 cards",
      time: "2 hours ago",
      accuracy: 90,
    },
    {
      module: "Numbers",
      action: "Reviewed 15 cards",
      time: "1 day ago",
      accuracy: 85,
    },
    {
      module: "Time",
      action: "Started new session",
      time: "2 days ago",
      accuracy: 78,
    },
  ],
  weeklyProgress: [
    { day: "Mon", cards: 25, accuracy: 88 },
    { day: "Tue", cards: 30, accuracy: 92 },
    { day: "Wed", cards: 20, accuracy: 85 },
    { day: "Thu", cards: 35, accuracy: 90 },
    { day: "Fri", cards: 28, accuracy: 87 },
    { day: "Sat", cards: 22, accuracy: 89 },
    { day: "Sun", cards: 18, accuracy: 91 },
  ],
};

const recentModules = [
  {
    id: "hiragana",
    name: "Hiragana",
    progress: 75,
    lastStudied: "2 hours ago",
  },
  { id: "katakana", name: "Katakana", progress: 20, lastStudied: "3 days ago" },
  {
    id: "colors_basic",
    name: "Colors",
    progress: 60,
    lastStudied: "1 day ago",
  },
];

const stats = [
  {
    label: "Study Time Today",
    value: dashboardData.todayStats.studyTime,
    icon: Clock,
    color: "text-purple-500",
  },
  {
    label: "Cards Reviewed",
    value: dashboardData.todayStats.cardsReviewed.toString(),
    icon: BookOpen,
    color: "text-blue-500",
  },
  {
    label: "Accuracy Rate",
    value: `${dashboardData.todayStats.accuracy}%`,
    icon: Award,
    color: "text-orange-500",
  },
  {
    label: "Current Streak",
    value: `${dashboardData.todayStats.streakDays} days`,
    icon: TrendingUp,
    color: "text-green-500",
  },
];

export default function DashboardPage() {
  const { data: authData } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [useRomajiInput, setUseRomajiInput] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-primary-purple to-secondary-purple relative overflow-hidden">
        <FloatingElements />

        {/* Header */}
        <div className="relative z-10 p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/home" className="flex items-center">
              <Image
                src="/logo1.webp"
                alt="BenkoFY logo"
                width={60}
                height={36}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                unoptimized
                priority
              />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-primary-foreground">
                Welcome back, {authData?.user?.name?.split(" ")[0] || "Student"}!
              </h1>
              <p className="text-primary-foreground/80">
                Ready to continue your Japanese learning journey?
              </p>
            </div>
          </div>

          {authData?.user && (
            <UserMenu
              user={authData.user}
              onProfileClick={() => window.location.href = '/profile'}
              onSettingsClick={() => window.location.href = '/settings'}
            />
          )}
        </div>

        {/* Main Content */}
        <div className="relative z-10 px-6 pb-6">
          <div className="max-w-6xl mx-auto">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => (
                <StatCard
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                />
              ))}
            </div>

            {/* Recent Modules */}
            <Card className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-primary-foreground">
                  Continue Learning
                </h2>
                <Link href="/modules">
                  <Button
                    variant="outline"
                    className="border-primary-foreground text-primary hover:bg-background/90"                  >
                    View All Modules
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentModules.map((module) => (
                  <Link
                    key={module.id}
                    href={`/flashcards/${module.id}`}
                    className="group"
                  >
                    <Card className="bg-background/5 hover:bg-background/10 transition-all duration-300">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-primary-foreground">
                          {module.name}
                        </h3>
                        <span className="text-sm text-primary-foreground/60">
                          {module.progress}%
                        </span>
                      </div>

                      <ProgressBar progress={module.progress} />

                      <div className="text-xs text-primary-foreground/60">
                        Last studied: {module.lastStudied}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Enhanced Dashboard Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <ActivityCard
                title="Recent Activity"
                activities={dashboardData.recentActivity}
              />

              {/* Weekly Progress */}
              <Card>
                <h3 className="text-xl font-semibold text-primary-foreground mb-4">
                  Weekly Progress
                </h3>
                <div className="space-y-3">
                  {dashboardData.weeklyProgress.map((day, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="font-semibold text-primary-foreground">
                        {day.day}
                      </span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-primary-foreground/80">
                          {day.cards} cards
                        </span>
                        <span className="text-sm font-semibold text-green-400">
                          {day.accuracy}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <Card>
                <h3 className="text-lg font-semibold text-primary-foreground mb-4">
                  Quick Start
                </h3>
                <div className="space-y-3">
                  <Link href="/flashcards/hiragana">
                    <Button className="w-full justify-start bg-background text-primary hover:bg-background/90">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Practice Hiragana
                    </Button>
                  </Link>
                  <Link href="/flashcards/colors_basic">
                    <Button className="w-full justify-start bg-background text-primary hover:bg-background/90">
                      <Target className="w-4 h-4 mr-2" />
                      Practice Colors
                    </Button>
                  </Link>
                  <Link href="/flashcards">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-background text-primary hover:bg-background/90"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Browse All Flashcards
                    </Button>
                  </Link>
                  <Link href="/modules">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-background text-primary hover:bg-background/90"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Learning Modules
                    </Button>
                  </Link>
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-primary-foreground mb-4">
                  Today&apos;s Goals
                </h3>
                <div className="space-y-3">
                  <GoalProgress
                    label="Study 20 cards"
                    current={12}
                    total={20}
                    showProgress
                  />

                  <GoalProgress
                    label="Maintain streak"
                    isDone
                  />

                  <GoalProgress
                    label="Practice for 15 min"
                    current={8}
                    total={15}
                    showProgress
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}