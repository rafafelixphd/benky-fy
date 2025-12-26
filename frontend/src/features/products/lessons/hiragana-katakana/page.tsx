"use client";

import { useState } from "react";
import { UserMenu } from "@/components/common/layout/navigation/user-menu";
import { useAuth } from "@/core/hooks";
import { FloatingElements } from "@/components/common/layout/background";
import {
  BookOpen,
  Check,
  Star,
  ArrowRight,
  GraduationCap,
  PenTool,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const lessonContent = {
  title: "Japanese Writing Systems: Hiragana & Katakana",
  sections: [
    {
      id: "intro",
      title: "Introduction to Japanese Writing",
      content:
        "Japanese uses three writing systems: Hiragana, Katakana, and Kanji. In this lesson, we'll focus on the phonetic scripts: Hiragana and Katakana.",
      icon: BookOpen,
      color: "from-blue-500 to-blue-600",
      status: "Available",
    },
    {
      id: "hiragana",
      title: "Hiragana Basics",
      content:
        "Hiragana is used for native Japanese words and grammatical elements. It's the first writing system Japanese children learn.",
      icon: PenTool,
      color: "from-green-500 to-green-600",
      examples: [
        { character: "あ", romaji: "a" },
        { character: "い", romaji: "i" },
        { character: "う", romaji: "u" },
        { character: "え", romaji: "e" },
        { character: "お", romaji: "o" },
      ],
      status: "Available",
    },
    {
      id: "katakana",
      title: "Katakana Introduction",
      content:
        "Katakana is mainly used for foreign words, scientific terms, and emphasis. It has the same sounds as Hiragana but different characters.",
      icon: PenTool,
      color: "from-purple-500 to-purple-600",
      examples: [
        { character: "ア", romaji: "a" },
        { character: "イ", romaji: "i" },
        { character: "ウ", romaji: "u" },
        { character: "エ", romaji: "e" },
        { character: "オ", romaji: "o" },
      ],
      status: "Available",
    },
    {
      id: "practice",
      title: "Interactive Practice",
      content:
        "Practice writing and recognizing both Hiragana and Katakana characters through interactive exercises.",
      icon: Star,
      color: "from-yellow-500 to-yellow-600",
      status: "Coming Soon",
    },
  ],
};

export default function HiraganaKatakanaPage() {
  const { data: authData } = useAuth();
  const [selectedSection, setSelectedSection] = useState("intro");

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-purple to-secondary-purple relative overflow-hidden">
      <FloatingElements />

      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/modules/lessons" className="flex items-center">
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
              {lessonContent.title}
            </h1>
            <p className="text-primary-foreground/80">
              Lesson 1: Foundation of Japanese Writing
            </p>
          </div>
        </div>

        {authData?.user && <UserMenu user={authData.user} />}
      </div>

      {/* Lesson Content */}
      <div className="relative z-10 px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          {/* Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lessonContent.sections.map((section) => {
              const IconComponent = section.icon;

              return (
                <Card
                  key={section.id}
                  className="p-6 bg-background/10 backdrop-blur-sm border-primary-foreground/20"
                >
                  <div className="flex items-center mb-4">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-r ${section.color} flex items-center justify-center mr-4`}
                    >
                      <IconComponent className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-primary-foreground">
                        {section.title}
                      </h3>
                      <span
                        className={`text-sm px-2 py-1 rounded ${
                          section.status === "Available"
                            ? "dark:bg-green-900 dark:text-green-200 bg-green-100 text-green-800"
                            : "dark:bg-yellow-900 dark:text-yellow-200 bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {section.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-primary-foreground/80 mb-4">
                    {section.content}
                  </p>

                  {section.examples && (
                    <div className="grid grid-cols-5 gap-2 mb-4">
                      {section.examples.map((example, index) => (
                        <div
                          key={index}
                          className="bg-background/20 rounded-lg p-2 text-center"
                        >
                          <div className="text-2xl font-bold text-primary-foreground">
                            {example.character}
                          </div>
                          <div className="text-sm text-primary-foreground/80">
                            {example.romaji}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.status === "Coming Soon" ? (
                    <Button className="w-full" disabled>
                      Coming Soon
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setSelectedSection(section.id)}
                      className="w-full bg-primary-purple hover:bg-primary-purple/90"
                    >
                      <span className="flex items-center justify-center">
                        Start Section
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </span>
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Progress Section */}
          <div className="mt-12">
            <Card className="p-6 bg-background/10 backdrop-blur-sm border-primary-foreground/20">
              <h3 className="text-xl font-semibold text-primary-foreground mb-4">
                Your Progress
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="h-2 bg-background/20 rounded-full overflow-hidden">
                      <div className="h-full w-1/4 bg-gradient-to-r from-green-500 to-green-600 rounded-full" />
                    </div>
                  </div>
                  <span className="ml-4 text-primary-foreground/80">
                    25% Complete
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-primary-foreground/80">
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-1" />
                    <span>Introduction</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span>2 Sections Remaining</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
