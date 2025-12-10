"use client";

import { useState, useMemo } from "react";
import { AuthGuard } from "@/components/common/auth";
import { UserMenu } from "@/components/common/layout/navigation/user-menu";
import { useAuth } from "@/core/hooks";
import { FloatingElements } from "@/components/common/layout/background";
import {
  BookOpen,
  Brain,
  Target,
  Zap,
  ArrowRight,
  Search,
  Clock,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { CompactCard } from "@/components/flashcard/core/display/cards";
import { Button } from "@/components/ui/button";

const flashcardCategories = [
  {
    id: "foundations",
    name: "Foundations",
    description: "Essential building blocks for Japanese",
    color: "from-blue-500 to-blue-600",
    icon: BookOpen,
    modules: [
      {
        id: "hiragana",
        name: "Hiragana",
        difficulty: "Beginner",
        progress: 75,
        cards: 46,
      },
      {
        id: "katakana",
        name: "Katakana",
        difficulty: "Beginner",
        progress: 60,
        cards: 46,
      },
      {
        id: "katakana_words",
        name: "Katakana Words",
        difficulty: "Intermediate",
        progress: 40,
        cards: 20,
      },
    ],
  },
  {
    id: "numbers-time",
    name: "Numbers & Time",
    description: "Practical daily use skills",
    color: "from-green-500 to-green-600",
    icon: Clock,
    modules: [
      {
        id: "numbers_basic",
        name: "Basic Numbers",
        difficulty: "Beginner",
        progress: 90,
        cards: 10,
      },
      {
        id: "numbers_extended",
        name: "Extended Numbers",
        difficulty: "Intermediate",
        progress: 45,
        cards: 20,
      },
      {
        id: "days_of_week",
        name: "Days of Week",
        difficulty: "Beginner",
        progress: 95,
        cards: 7,
      },
      {
        id: "months_complete",
        name: "Months",
        difficulty: "Beginner",
        progress: 30,
        cards: 12,
      },
    ],
  },
  {
    id: "essential-vocab",
    name: "Essential Vocabulary",
    description: "Core communication words",
    color: "from-purple-500 to-purple-600",
    icon: MessageCircle,
    modules: [
      {
        id: "greetings_essential",
        name: "Greetings",
        difficulty: "Beginner",
        progress: 85,
        cards: 15,
      },
      {
        id: "question_words",
        name: "Question Words",
        difficulty: "Beginner",
        progress: 55,
        cards: 12,
      },
      {
        id: "base_nouns",
        name: "Basic Nouns",
        difficulty: "Beginner",
        progress: 70,
        cards: 25,
      },
      {
        id: "colors_basic",
        name: "Colors",
        difficulty: "Beginner",
        progress: 80,
        cards: 10,
      },
    ],
  },
  {
    id: "grammar-structure",
    name: "Grammar & Structure",
    description: "Language building blocks",
    color: "from-orange-500 to-orange-600",
    icon: Brain,
    modules: [
      {
        id: "adjectives",
        name: "Adjectives",
        difficulty: "Intermediate",
        progress: 65,
        cards: 30,
      },
      {
        id: "verbs",
        name: "Japanese Verbs",
        difficulty: "Intermediate",
        progress: 25,
        cards: 50,
      },
      {
        id: "vocab",
        name: "Vocabulary",
        difficulty: "Intermediate",
        progress: 50,
        cards: 40,
      },
    ],
  },
];

export default function FlashcardsPage() {
  const { data: authData } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter categories and modules based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return flashcardCategories;

    return flashcardCategories
      .map((category) => ({
        ...category,
        modules: category.modules.filter(
          (module) =>
            module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            module.difficulty
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()),
        ),
      }))
      .filter((category) => category.modules.length > 0);
  }, [searchTerm]);

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
                Flashcards
              </h1>
              <p className="text-primary-foreground/80">
                Organized by learning progression
              </p>
            </div>
          </div>

          {authData?.user && <UserMenu user={authData.user} />}
        </div>

        {/* Search Bar */}
        <div className="relative z-10 px-6 mb-6">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search flashcards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="relative z-10 px-6 pb-6">
          <div className="max-w-6xl mx-auto space-y-8">
            {filteredCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <div
                  key={category.id}
                  className="bg-background/10 backdrop-blur-sm rounded-lg p-6"
                >
                  <div className="flex items-center mb-6">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center mr-4`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-primary-foreground">
                        {category.name}
                      </h2>
                      <p className="text-primary-foreground/80">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {category.modules.map((module) => {
                      const enhancedModule = {
                        ...module,
                        description: "",
                        color: category.color,
                        icon: category.icon,
                        estimatedTime: "10-15 min",
                        mastery: Math.floor(module.progress * 0.8),
                        streak: Math.floor(Math.random() * 5),
                        difficulty: module.difficulty as
                          | "Beginner"
                          | "Intermediate"
                          | "Advanced",
                      };

                      return (
                        <CompactCard
                          key={module.id}
                          module={enhancedModule}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Flashcards Section */}
          <div className="mt-12">
            <div className="bg-background/10 backdrop-blur-sm rounded-lg p-6 max-w-4xl mx-auto mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary-foreground">
                      Custom Flashcards
                    </h3>
                    <p className="text-primary-foreground/80">
                      Create personalized learning sessions
                    </p>
                  </div>
                </div>
                <Link href="/flashcards/custom">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Custom
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background/20 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-semibold text-primary-foreground mb-2">
                    Personalized Learning
                  </h4>
                  <p className="text-sm text-primary-foreground/80 mb-3">
                    Configure word types, display modes, and input methods
                  </p>
                  <div className="text-xs text-primary-foreground/60">
                    Choose what to learn and how to practice
                  </div>
                </div>
                <div className="bg-background/20 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-semibold text-primary-foreground mb-2">
                    Adaptive Difficulty
                  </h4>
                  <p className="text-sm text-primary-foreground/80 mb-3">
                    AI-powered adjustments based on your performance
                  </p>
                  <div className="text-xs text-primary-foreground/60">
                    Optimized for your learning pace
                  </div>
                </div>
                <div className="bg-background/20 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-semibold text-primary-foreground mb-2">
                    Detailed Analytics
                  </h4>
                  <p className="text-sm text-primary-foreground/80 mb-3">
                    Track progress across all learning dimensions
                  </p>
                  <div className="text-xs text-primary-foreground/60">
                    Insights to improve your study sessions
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Path Recommendations */}
          <div className="mt-12">
            <div className="bg-background/10 backdrop-blur-sm rounded-lg p-6 max-w-4xl mx-auto">
              <h3 className="text-xl font-semibold text-primary-foreground mb-6 text-center">
                Recommended Learning Paths
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-background/20 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-semibold text-primary-foreground mb-2">
                    Complete Beginner Path
                  </h4>
                  <p className="text-sm text-primary-foreground/80 mb-3">
                    Start here if you're new to Japanese
                  </p>
                  <div className="text-xs text-primary-foreground/60 mb-2">
                    Modules: Hiragana → Katakana → Basic Numbers → Greetings
                  </div>
                  <div className="text-xs text-primary-foreground/60">
                    Estimated time: 2-3 weeks
                  </div>
                </div>
                <div className="bg-background/20 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-semibold text-primary-foreground mb-2">
                    Practical Communication Path
                  </h4>
                  <p className="text-sm text-primary-foreground/80 mb-3">
                    Focus on daily conversation skills
                  </p>
                  <div className="text-xs text-primary-foreground/60 mb-2">
                    Modules: Greetings → Question Words → Days of Week → Colors
                  </div>
                  <div className="text-xs text-primary-foreground/60">
                    Estimated time: 1-2 weeks
                  </div>
                </div>
                <div className="bg-background/20 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-semibold text-primary-foreground mb-2">
                    Grammar Foundation Path
                  </h4>
                  <p className="text-sm text-primary-foreground/80 mb-3">
                    Build sentence construction skills
                  </p>
                  <div className="text-xs text-primary-foreground/60 mb-2">
                    Modules: Adjectives → Verbs → Basic Nouns → Vocabulary
                  </div>
                  <div className="text-xs text-primary-foreground/60">
                    Estimated time: 3-4 weeks
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
