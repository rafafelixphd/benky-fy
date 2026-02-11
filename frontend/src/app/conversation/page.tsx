"use client";

import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/common/auth/auth-guard";
import { UserMenu } from "@/components/common/layout/navigation/user-menu";
import { useAuth } from "@/lib/hooks/hooks";
import { NavigationHeader } from "@/components/common/layout/navigation/navigation-header";
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
import { ChatInterface } from "./components/ChatInterface";

export default function ConversationPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-primary-purple to-secondary-purple relative overflow-hidden flex flex-col">
        <FloatingElements />

        <NavigationHeader />

        <div className="relative z-10 pt-24 px-6 pb-6 text-center flex-shrink-0">
          <h1 className="text-4xl font-bold text-white mb-2">Conversation</h1>
          <p className="text-white/80 text-lg">Chat with our AI in Japanese</p>
        </div>

        {/* Main Content */}
        <div className="flex-1 relative z-10 px-4 pb-8 flex justify-center">
            <ChatInterface />
        </div>
      </div>
    </AuthGuard>
  );
}