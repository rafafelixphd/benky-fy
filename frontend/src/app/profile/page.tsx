"use client";

import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/common/auth";
import { UserMenu } from "@/components/common/layout/navigation/user-menu";
import { useAuth } from "@/core/hooks";
import type { UserData } from "@/types/user";
import { FloatingElements } from "@/components/common/layout/background";
import {
  User,
  Calendar,
  Clock,
  Trophy,
  Target,
  BookOpen,
  Settings,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { data: authData } = useAuth();
  const userData = authData?.user as UserData;

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
                User Profile
              </h1>
              <p className="text-primary-foreground/80">
                Manage your learning journey
              </p>
            </div>
          </div>

          {authData?.user && <UserMenu user={authData.user} />}
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 pb-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Info */}
              <Card className="p-6 bg-background/10 backdrop-blur-sm border-primary-foreground/20">
                <div className="text-center mb-6">
                  {userData ? (
                    <>
                      <img
                        src={userData.picture || "/user_icon.svg"}
                        alt="Profile"
                        className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-primary-foreground/20 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/user_icon.svg";
                        }}
                      />
                      <h2 className="text-2xl font-bold text-primary-foreground">
                        {userData.name}
                      </h2>
                      <p className="text-primary-foreground/80">
                        {userData.email}
                      </p>
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mt-2">
                        {userData.provider} User
                      </span>
                    </>
                  ) : (
                    <div className="text-center">
                      <p className="text-primary-foreground">
                        Loading profile...
                      </p>
                    </div>
                  )}
                </div>

                {userData && (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-primary-foreground/80">
                        Member since:
                      </span>
                      <span className="text-primary-foreground">
                        {userData.joinDate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary-foreground/80">
                        Current Level:
                      </span>
                      <span className="font-semibold text-primary-foreground">
                        {userData.currentLevel}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary-foreground/80">
                        Total Study Time:
                      </span>
                      <span className="text-primary-foreground">
                        {userData.totalStudyTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary-foreground/80">
                        Current Streak:
                      </span>
                      <span className="font-semibold text-green-400">
                        {userData.streakDays} days
                      </span>
                    </div>
                  </div>
                )}
              </Card>

              {/* Learning Stats */}
              <Card className="p-6 bg-background/10 backdrop-blur-sm border-primary-foreground/20">
                <h3 className="text-xl font-semibold text-primary-foreground mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Learning Statistics
                </h3>
                {userData && (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-primary-foreground/80">
                        Words Learned:
                      </span>
                      <span className="font-semibold text-primary-foreground">
                        {userData.totalWordsLearned}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary-foreground/80">
                        Favorite Modules:
                      </span>
                      <div className="text-right">
                        {userData.favoriteModules?.map((module: string) => (
                          <span
                            key={module}
                            className="block text-sm text-primary-foreground"
                          >
                            {module}
                          </span>
                        )) || "No modules yet"}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-primary-foreground/20">
                  <h4 className="font-semibold text-primary-foreground mb-3">
                    Recent Achievements
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-primary-foreground/80">
                      <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
                      Completed Hiragana Module
                    </div>
                    <div className="flex items-center text-sm text-primary-foreground/80">
                      <Target className="w-4 h-4 mr-2 text-green-400" />
                      7-day learning streak
                    </div>
                    <div className="flex items-center text-sm text-primary-foreground/80">
                      <BookOpen className="w-4 h-4 mr-2 text-blue-400" />
                      Learned 50 new words
                    </div>
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-6 bg-background/10 backdrop-blur-sm border-primary-foreground/20">
                <h3 className="text-xl font-semibold text-primary-foreground mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button
                    asChild
                    className="w-full justify-start bg-background text-primary hover:bg-background/90"
                  >
                    <Link href="/dashboard">
                      <User className="w-4 h-4 mr-2" />
                      Go to Dashboard
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <Link href="/stats">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Statistics
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <Link href="/flashcards">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Practice Flashcards
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <Link href="/modules">
                      <Target className="w-4 h-4 mr-2" />
                      Browse Modules
                    </Link>
                  </Button>
                </div>

                <div className="mt-6 pt-4 border-t border-primary-foreground/20">
                  <h4 className="font-semibold text-primary-foreground mb-3">
                    Account Settings
                  </h4>
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Preferences
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Study Schedule
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
