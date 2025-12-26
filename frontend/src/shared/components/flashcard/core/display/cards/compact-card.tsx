'use client';

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface FlashcardModule {
  id: string;
  name: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  cards: number;
  progress: number;
  color: string;
  icon: React.ComponentType<any>;
}

export function CompactCard({ module }: { module: FlashcardModule }) {
  const [isHovered, setIsHovered] = useState(false);
  const IconComponent = module.icon;

  return (
    <Link href={`/flashcards/${module.id}`}>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card
          className={`
            group relative overflow-hidden transition-all duration-300
            bg-gradient-to-br from-background/90 to-background/60
            backdrop-blur-sm border border-primary-foreground/10
            hover:border-primary-purple/40 hover:shadow-xl hover:shadow-primary-purple/10
            hover:scale-105 hover:-translate-y-1
            w-full h-[220px] flex flex-col
          `}
        >
          {/* Animated Background */}
          <div
            className={`
              absolute inset-0 bg-gradient-to-br ${module.color} opacity-0
              transition-opacity duration-300 group-hover:opacity-5
            `}
          />

          <div className="relative z-10 p-6 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-start space-x-3 min-h-[48px]">
                <div
                  className={`
                    w-10 h-10 rounded-lg bg-gradient-to-br ${module.color} 
                    flex-shrink-0 flex items-center justify-center shadow-md
                    group-hover:scale-110 transition-transform duration-200
                  `}
                >
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-primary-foreground group-hover:text-primary-purple transition-colors line-clamp-2 min-h-[40px]">
                    {module.name}
                  </h3>
                  <p className="text-xs text-primary-foreground/60">
                    {module.cards} cards
                  </p>
                </div>
              </div>

              <span className="text-xs bg-primary-foreground/20 text-primary-foreground px-2 py-1 rounded-full flex-shrink-0 ml-2">
                {module.difficulty}
              </span>
            </div>

            {/* Progress */}
            <div className="mb-5">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-primary-foreground/70">Progress</span>
                <span className="text-primary-foreground/70">
                  {module.progress}%
                </span>
              </div>
              <div className="w-full bg-primary-foreground/10 rounded-full h-2">
                <div
                  className={`h-full bg-gradient-to-r ${module.color} rounded-full transition-all duration-500`}
                  style={{ width: `${module.progress}%` }}
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-auto">
              <Button
                size="sm"
                className="w-full group-hover:bg-primary-purple group-hover:text-white transition-all duration-200"
                variant="outline"
              >
                <Play className="w-3 h-3 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Start
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Link>
  );
}
