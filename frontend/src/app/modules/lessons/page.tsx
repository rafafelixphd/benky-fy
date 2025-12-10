"use client";

import { UserMenu } from "@/components/common/layout/navigation/user-menu";
import { useAuth } from "@/core/hooks";
import { FloatingElements } from "@/components/common/layout/background";
import {
  BookOpen,
  ArrowRight,
  GraduationCap,
  PenTool,
  MessageSquare,
  Brain,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const availableLessons = [
  {
    id: "hiragana-katakana",
    title: "Hiragana & Katakana",
    description: "Master the basics of Japanese writing systems",
    level: "Beginner",
    duration: "2-3 hours",
    icon: PenTool,
    color: "from-blue-500 to-blue-600",
    status: "Available",
  },
  {
    id: "basic-greetings",
    title: "Basic Greetings",
    description: "Learn essential Japanese greetings and introductions",
    level: "Beginner",
    duration: "1-2 hours",
    icon: MessageSquare,
    color: "from-green-500 to-green-600",
    status: "Coming Soon",
  },
  {
    id: "numbers-counting",
    title: "Numbers & Counting",
    description: "Learn to count and use numbers in Japanese",
    level: "Beginner",
    duration: "2 hours",
    icon: Brain,
    color: "from-yellow-500 to-yellow-600",
    status: "Coming Soon",
  },
  {
    id: "basic-grammar",
    title: "Basic Grammar",
    description: "Introduction to Japanese sentence structure",
    level: "Beginner",
    duration: "3-4 hours",
    icon: BookOpen,
    color: "from-purple-500 to-purple-600",
    status: "Coming Soon",
  },
];

export default function LessonsPage() {
  const { data: authData } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-purple to-secondary-purple relative overflow-hidden">
      <FloatingElements />

      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/modules" className="flex items-center">
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
              Japanese Lessons
            </h1>
            <p className="text-primary-foreground/80">
              Start your structured learning journey
            </p>
          </div>
        </div>

        {authData?.user && <UserMenu user={authData.user} />}
      </div>

      {/* Lessons Grid */}
      <div className="relative z-10 px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableLessons.map((lesson) => {
              const IconComponent = lesson.icon;

              return (
                <Card
                  key={lesson.id}
                  className="p-6 bg-background/10 backdrop-blur-sm border-primary-foreground/20"
                >
                  <div className="flex items-center mb-4">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-r ${lesson.color} flex items-center justify-center mr-4`}
                    >
                      <IconComponent className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-primary-foreground">
                        {lesson.title}
                      </h3>
                      <div className="flex gap-2 mt-1">
                        <span className="text-sm px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200 bg-blue-100 text-blue-800">
                          {lesson.level}
                        </span>
                        <span className="text-sm px-2 py-1 rounded dark:bg-purple-900 dark:text-purple-200 bg-purple-100 text-purple-800">
                          {lesson.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-primary-foreground/80 mb-4">
                    {lesson.description}
                  </p>

                  {lesson.status === "Coming Soon" ? (
                    <Button className="w-full" disabled>
                      Coming Soon
                    </Button>
                  ) : (
                    <Button
                      asChild
                      className="w-full bg-primary-purple hover:bg-primary-purple/90"
                    >
                      <Link href={`/modules/lessons/${lesson.id}`}>
                        <span className="flex items-center justify-center">
                          Start Lesson
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
          <div className="mt-12">
            <Card className="p-6 bg-background/10 backdrop-blur-sm border-primary-foreground/20">
              <h3 className="text-xl font-semibold text-primary-foreground mb-4">
                Learning Path Guide
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-primary-foreground mb-2">
                    📚 Recommended Order
                  </h4>
                  <ol className="list-decimal list-inside text-primary-foreground/80 space-y-1">
                    <li>Hiragana & Katakana</li>
                    <li>Basic Greetings</li>
                    <li>Numbers & Counting</li>
                    <li>Basic Grammar</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-medium text-primary-foreground mb-2">
                    ⭐ Study Tips
                  </h4>
                  <ul className="text-primary-foreground/80 space-y-1">
                    <li>• Complete each section before moving on</li>
                    <li>• Practice writing characters daily</li>
                    <li>• Review previous lessons regularly</li>
                    <li>• Use flashcards for reinforcement</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
