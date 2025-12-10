"use client";

import { useState } from "react";
import { UserMenu } from "@/components/common/layout/navigation/user-menu";
import { useAuth } from "@/core/hooks";
import { FloatingElements } from "@/components/common/layout/background";
import {
  BookOpen,
  Brain,
  Target,
  Zap,
  ArrowRight,
  MessageSquare,
  FileText,
  GraduationCap,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ModuleStatus = "Available" | "Mock Up" | "Coming Soon";

interface LearningModule {
  id: string;
  name: string;
  description: string;
  status: ModuleStatus;
  icon: LucideIcon;
  color: string;
}

const learningModules: LearningModule[] = [
  {
    id: "lessons",
    name: "Lessons",
    description: "Structured Japanese lessons with grammar and vocabulary",
    status: "Mock Up",
    icon: GraduationCap,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "flashcards",
    name: "Flashcards",
    description: "Practice with interactive flashcards",
    status: "Available",
    icon: Brain,
    color: "from-green-500 to-green-600",
  },
  {
    id: "kanjistrikes",
    name: "Kanji Strikes",
    description: "Practice your kanji writing",
    status: "Coming Soon",
    icon: FileText,
    color: "from-green-500 to-green-600",
  },
  {
    id: "chat",
    name: "AI Tutor Chat",
    description: "Chat with AI tutors for personalized help",
    status: "Mock Up",
    icon: MessageSquare,
    color: "from-orange-500 to-orange-600",
  },
  {
    id: "sentences",
    name: "Sentences Practice",
    description: "Practice with real Japanese sentences",
    status: "Mock Up",
    icon: FileText,
    color: "from-purple-500 to-purple-600",
  },
];

export default function ModulesPage() {
  const { data: authData } = useAuth();

  return (
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
            <h1 className="text-3xl font-bold text-foreground">
              Learning Modules
            </h1>
            <p className="text-foreground/80">Choose your learning path</p>
          </div>
        </div>

        {authData?.user ? (
          <UserMenu user={authData.user} />
        ) : (
          <Link href="/auth/login">
            <Button className="bg-background text-primary hover:bg-background/90">
              Sign In
            </Button>
          </Link>
        )}
      </div>

      {/* Modules Grid */}
      <div className="relative z-10 px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learningModules.map((module) => {
              const IconComponent = module.icon;
              const isAvailable = module.status === "Available";

              return (
                <Card
                  key={module.id}
                  className="p-6 bg-background/10 backdrop-blur-sm border-primary-foreground/20"
                >
                  <div className="flex items-center mb-4">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-r ${module.color} flex items-center justify-center mr-4`}
                    >
                      <IconComponent className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground">
                        {module.name}
                      </h3>
                      <span
                        className={`text-sm px-2 py-1 rounded ${
                          module.status === "Available"
                            ? "dark:bg-green-900 dark:text-green-200 bg-green-100 text-green-800"
                            : module.status === "Mock Up"
                              ? "dark:bg-blue-900 dark:text-blue-200 bg-blue-100 text-blue-800"
                              : "dark:bg-yellow-900 dark:text-yellow-200 bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {module.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-foreground/80 mb-4">
                    {module.description}
                  </p>

                  {module.status === "Coming Soon" ? (
                    <Button className="w-full" disabled>
                      Coming Soon
                    </Button>
                  ) : (
                    <Button
                      asChild
                      className={`w-full ${module.status === "Mock Up" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
                    >
                      <Link
                        href={
                          isAvailable
                            ? `/${module.id}`
                            : `/modules/${module.id}`
                        }
                      >
                        <span className="flex items-center justify-center">
                          {module.status === "Mock Up"
                            ? "View Demo"
                            : "Start Learning"}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </span>
                      </Link>
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <div className="bg-background/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Learning Path
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-foreground/80">
                <div>
                  <div className="font-medium text-foreground mb-2">
                    📚 Structured Learning
                  </div>
                  <p>Follow lessons designed by Japanese language experts</p>
                </div>
                <div>
                  <div className="font-medium text-foreground mb-2">
                    🎴 Interactive Practice
                  </div>
                  <p>Reinforce learning with flashcards and exercises</p>
                </div>
                <div>
                  <div className="font-medium text-foreground mb-2">
                    📝 Real Context
                  </div>
                  <p>Practice with authentic Japanese sentences</p>
                </div>
                <div>
                  <div className="font-medium text-foreground mb-2">
                    🤖 AI Support
                  </div>
                  <p>Get personalized help from AI tutors</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
