"use client";

import { useState } from "react";
import { UserMenu } from "@/components/common/layout/navigation/user-menu";
import { useAuth } from "@/core/hooks";
import { FloatingElements } from "@/components/common/layout/background";
import {
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Settings,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const dummyFlashcards = [
  {
    id: 1,
    kanji: "食べる",
    hiragana: "たべる",
    english: "to eat",
    example: "私はお寿司を食べます。",
    exampleReading: "わたしはおすしをたべます。",
    exampleTranslation: "I eat sushi.",
  },
  {
    id: 2,
    kanji: "飲む",
    hiragana: "のむ",
    english: "to drink",
    example: "水を飲みます。",
    exampleReading: "みずをのみます。",
    exampleTranslation: "I drink water.",
  },
  {
    id: 3,
    kanji: "見る",
    hiragana: "みる",
    english: "to see/watch",
    example: "映画を見ました。",
    exampleReading: "えいがをみました。",
    exampleTranslation: "I watched a movie.",
  },
];

export default function FlashcardsModulePage() {
  const { data: authData } = useAuth();
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showExample, setShowExample] = useState(false);

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % dummyFlashcards.length);
    setIsFlipped(false);
    setShowExample(false);
  };

  const prevCard = () => {
    setCurrentCard(
      (prev) => (prev - 1 + dummyFlashcards.length) % dummyFlashcards.length,
    );
    setIsFlipped(false);
    setShowExample(false);
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
              Flashcards
            </h1>
            <p className="text-primary-foreground/80">Basic Verbs Module</p>
          </div>
        </div>

        {authData?.user && <UserMenu user={authData.user} />}
      </div>

      {/* Flashcard Interface */}
      <div className="relative z-10 px-6 pb-6">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-8 flex items-center justify-between">
            <div className="text-primary-foreground/80">
              Card {currentCard + 1} of {dummyFlashcards.length}
            </div>
            <Button
              variant="outline"
              className="border-primary-foreground/20 text-primary-foreground"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>

          {/* Card */}
          <div
            className="bg-background/10 backdrop-blur-sm rounded-xl border border-primary-foreground/20 p-8 mb-8 min-h-[300px] cursor-pointer transition-all transform hover:scale-[1.02]"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className="text-center space-y-6">
              {!isFlipped ? (
                <>
                  <div className="text-4xl font-bold text-primary-foreground mb-4">
                    {dummyFlashcards[currentCard].kanji}
                  </div>
                  <div className="text-xl text-primary-foreground/80">
                    {dummyFlashcards[currentCard].hiragana}
                  </div>
                  <p className="text-primary-foreground/60 text-sm">
                    Click to reveal meaning
                  </p>
                </>
              ) : (
                <>
                  <div className="text-3xl text-primary-foreground mb-4">
                    {dummyFlashcards[currentCard].english}
                  </div>
                  {showExample ? (
                    <div className="space-y-2 text-primary-foreground/80">
                      <p>{dummyFlashcards[currentCard].example}</p>
                      <p className="text-sm">
                        {dummyFlashcards[currentCard].exampleReading}
                      </p>
                      <p className="text-sm italic">
                        {dummyFlashcards[currentCard].exampleTranslation}
                      </p>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowExample(true);
                      }}
                      className="text-primary-foreground/80 hover:text-primary-foreground"
                    >
                      Show example
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={prevCard}
              className="border-primary-foreground/20 text-primary-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsFlipped(false);
                setShowExample(false);
              }}
              className="border-primary-foreground/20 text-primary-foreground"
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              className="border-primary-foreground/20 text-primary-foreground"
            >
              <Volume2 className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              onClick={nextCard}
              className="border-primary-foreground/20 text-primary-foreground"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
