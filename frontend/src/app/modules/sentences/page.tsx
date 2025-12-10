"use client";

import { useState } from "react";
import { UserMenu } from "@/components/common/layout/navigation/user-menu";
import { useAuth } from "@/core/hooks";
import { FloatingElements } from "@/components/common/layout/background";
import {
  Send,
  Bot,
  User,
  Loader2,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Info,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const dummyExercise = {
  english: "The cat is eating at the park",
  correctAnswer: "猫は公園で食べています",
  particles: [
    {
      text: "猫",
      type: "noun",
      color: "text-yellow-400 dark:text-yellow-300",
      explanation: "Subject: cat",
    },
    {
      text: "は",
      type: "particle",
      color: "text-blue-400 dark:text-blue-300",
      explanation: "Topic marker: indicates 'cat' is the topic",
    },
    {
      text: "公園",
      type: "noun",
      color: "text-yellow-400 dark:text-yellow-300",
      explanation: "Location: park",
    },
    {
      text: "で",
      type: "particle",
      color: "text-green-400 dark:text-green-300",
      explanation: "Location particle: indicates where the action takes place",
    },
    {
      text: "食べて",
      type: "verb",
      color: "text-red-400 dark:text-red-300",
      explanation: "Verb stem: eat",
    },
    {
      text: "います",
      type: "auxiliary",
      color: "text-purple-400 dark:text-purple-300",
      explanation: "Present continuous form: indicates ongoing action",
    },
  ],
  improvements: [
    "✓ Good use of は to mark the subject",
    "✓ Correct use of で to indicate location",
    "✓ Present continuous form is appropriate",
    "Consider: You could also say 公園の中で to be more specific (inside the park)",
  ],
};

export default function SentencesPage() {
  const { data: authData } = useAuth();
  const [userAnswer, setUserAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  const handleNewSentence = () => {
    setUserAnswer("");
    setIsSubmitted(false);
  };

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
            <h1 className="text-3xl font-bold text-primary-foreground">
              Sentence Practice
            </h1>
            <p className="text-primary-foreground/80">
              Translate and learn sentence structure
            </p>
          </div>
        </div>

        {authData?.user && <UserMenu user={authData.user} />}
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-6">
        <div className="max-w-3xl mx-auto">
          {/* Exercise Card */}
          <div className="bg-background/10 backdrop-blur-sm rounded-lg border border-primary-foreground/20 p-6 mb-6">
            <div className="flex items-center gap-2 mb-6">
              <Bot className="w-6 h-6 text-primary-foreground" />
              <p className="text-xl text-primary-foreground">
                Translate this sentence to Japanese:
              </p>
            </div>
            <p className="text-2xl font-medium text-primary-foreground mb-8 text-center">
              "{dummyExercise.english}"
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your translation here..."
                disabled={isSubmitted}
                className="w-full bg-white/10 dark:bg-background/20 border border-primary-foreground/20 rounded-lg px-4 py-3 text-foreground dark:text-primary-foreground placeholder-foreground/60 dark:placeholder-primary-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary-purple disabled:opacity-50"
              />

              {!isSubmitted ? (
                <Button
                  type="submit"
                  disabled={!userAnswer.trim() || isLoading}
                  className="w-full bg-primary-purple hover:bg-primary-purple/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Submit Answer
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNewSentence}
                  className="w-full bg-primary-purple hover:bg-primary-purple/90"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Try Another Sentence
                </Button>
              )}
            </form>
          </div>

          {/* Feedback Section */}
          {isSubmitted && (
            <div className="space-y-6">
              {/* Particle Analysis */}
              <div className="bg-background/10 backdrop-blur-sm rounded-lg border border-primary-foreground/20 p-6">
                <h3 className="text-lg font-semibold text-primary-foreground mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Sentence Breakdown
                </h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {dummyExercise.particles.map((part, i) => (
                    <div key={i} className="group relative">
                      <span className={`text-2xl ${part.color}`}>
                        {part.text}
                      </span>
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                        {part.explanation}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Improvements */}
                <div className="space-y-2">
                  {dummyExercise.improvements.map((improvement, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 text-sm ${
                        improvement.startsWith("✓")
                          ? "text-green-400"
                          : "text-blue-400"
                      }`}
                    >
                      {improvement.startsWith("✓") ? (
                        <ThumbsUp className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <Info className="w-4 h-4 flex-shrink-0" />
                      )}
                      {improvement}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
