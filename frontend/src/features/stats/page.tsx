"use client";

import { AuthGuard } from "@/components/common/auth";
import { UserMenu } from "@/components/common/layout/navigation/user-menu";
import { useAuth } from "@/core/hooks";
import { FloatingElements } from "@/components/common/layout/background";
import {
  BarChart3,
  Clock,
  Target,
  Trophy,
  TrendingUp,
  BookOpen,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const statsData = {
  overallStats: {
    totalStudyTime: "45 hours 30 minutes",
    totalCardsReviewed: 1250,
    averageAccuracy: 87,
    longestStreak: 25,
    totalWordsLearned: 150,
  },
  moduleStats: [
    {
      name: "Hiragana",
      progress: 85,
      cardsReviewed: 450,
      accuracy: 90,
      timeSpent: "15 hours",
    },
    {
      name: "Katakana",
      progress: 70,
      cardsReviewed: 320,
      accuracy: 85,
      timeSpent: "12 hours",
    },
    {
      name: "Numbers",
      progress: 95,
      cardsReviewed: 280,
      accuracy: 92,
      timeSpent: "8 hours",
    },
    {
      name: "Time",
      progress: 60,
      cardsReviewed: 200,
      accuracy: 82,
      timeSpent: "10 hours",
    },
  ],
  monthlyProgress: [
    { month: "Jan", cards: 180, accuracy: 85 },
    { month: "Feb", cards: 220, accuracy: 87 },
    { month: "Mar", cards: 250, accuracy: 89 },
    { month: "Apr", cards: 280, accuracy: 88 },
    { month: "May", cards: 320, accuracy: 90 },
  ],
};

export default function StatsPage() {
  const { data: authData } = useAuth();

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
                Learning Statistics
              </h1>
              <p className="text-primary-foreground/80">
                Track your progress and achievements
              </p>
            </div>
          </div>

          {authData?.user && <UserMenu user={authData.user} />}
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 pb-6">
          <div className="max-w-6xl mx-auto">
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <Card className="p-6 text-center bg-background/10 backdrop-blur-sm border-primary-foreground/20">
                <Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-primary-foreground">
                  {statsData.overallStats.totalStudyTime}
                </h3>
                <p className="text-primary-foreground/80">Total Study Time</p>
              </Card>
              <Card className="p-6 text-center bg-background/10 backdrop-blur-sm border-primary-foreground/20">
                <BookOpen className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-primary-foreground">
                  {statsData.overallStats.totalCardsReviewed}
                </h3>
                <p className="text-primary-foreground/80">Cards Reviewed</p>
              </Card>
              <Card className="p-6 text-center bg-background/10 backdrop-blur-sm border-primary-foreground/20">
                <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-primary-foreground">
                  {statsData.overallStats.averageAccuracy}%
                </h3>
                <p className="text-primary-foreground/80">Average Accuracy</p>
              </Card>
              <Card className="p-6 text-center bg-background/10 backdrop-blur-sm border-primary-foreground/20">
                <Trophy className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-primary-foreground">
                  {statsData.overallStats.longestStreak}
                </h3>
                <p className="text-primary-foreground/80">Longest Streak</p>
              </Card>
              <Card className="p-6 text-center bg-background/10 backdrop-blur-sm border-primary-foreground/20">
                <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-primary-foreground">
                  {statsData.overallStats.totalWordsLearned}
                </h3>
                <p className="text-primary-foreground/80">Words Learned</p>
              </Card>
            </div>

            {/* Module Stats */}
            <Card className="p-6 mb-8 bg-background/10 backdrop-blur-sm border-primary-foreground/20">
              <h3 className="text-xl font-semibold text-primary-foreground mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Module Statistics
              </h3>
              <div className="space-y-4">
                {statsData.moduleStats.map((module, index) => (
                  <div key={index} className="p-4 bg-background/5 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-primary-foreground">
                        {module.name}
                      </h4>
                      <span className="text-sm text-primary-foreground/80">
                        {module.progress}% Complete
                      </span>
                    </div>
                    <div className="w-full bg-primary-foreground/20 rounded-full h-2 mb-3">
                      <div
                        className="bg-primary-purple h-2 rounded-full"
                        style={{ width: `${module.progress}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-primary-foreground/80">
                          Cards:
                        </span>
                        <span className="font-semibold ml-2 text-primary-foreground">
                          {module.cardsReviewed}
                        </span>
                      </div>
                      <div>
                        <span className="text-primary-foreground/80">
                          Accuracy:
                        </span>
                        <span className="font-semibold ml-2 text-green-400">
                          {module.accuracy}%
                        </span>
                      </div>
                      <div>
                        <span className="text-primary-foreground/80">
                          Time:
                        </span>
                        <span className="font-semibold ml-2 text-primary-foreground">
                          {module.timeSpent}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Monthly Progress */}
            <Card className="p-6 bg-background/10 backdrop-blur-sm border-primary-foreground/20">
              <h3 className="text-xl font-semibold text-primary-foreground mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Monthly Progress
              </h3>
              <div className="space-y-3">
                {statsData.monthlyProgress.map((month, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-background/5 rounded-lg"
                  >
                    <span className="font-semibold text-primary-foreground">
                      {month.month}
                    </span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-primary-foreground/80">
                        {month.cards} cards
                      </span>
                      <span className="text-sm font-semibold text-green-400">
                        {month.accuracy}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <div className="mt-8 text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-background text-primary hover:bg-background/90"
                >
                  <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Link href="/flashcards">Continue Learning</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
