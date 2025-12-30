"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthGuard } from "@/components/common/auth";
import { useAuth } from "@/lib/hooks/hooks";
import { FloatingElements } from "@/components/common/layout/background";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Settings,
  Play,
  BarChart3,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { FlashcardSettingsModal } from "./settings/";
import { FlashcardSettings } from "@/entities/flashcards/settings"; // Correct type
import { ProductsHeader } from "@/components/layout/header";
import { wordsApiClient } from "@/api/private/words/api-client";

export default function CustomFlashcardPage() {
  const router = useRouter();
  const { data: authData } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<FlashcardSettings | null>(null);
  const [isLoadingCards, setIsLoadingCards] = useState(false);

  const handleStartSession = async (currentSettings: FlashcardSettings) => {
    setIsLoadingCards(true);
    try {
      // Only map if backend needs specific transformation, currently passing as is if compatible
      // But backend needs 'jlpt' (string) and 'categories' (list)
      // FlashcardSettings has 'level' (list) and 'tag' (list)
      // We map the first level/tag to backend format for now
      await wordsApiClient.initSession(currentSettings);
      setSettings(currentSettings);
      setShowSettings(false);

      // Navigate to practice page
      router.push("/flashcards/practice");
    } catch (e) {
      console.error("Failed to start session", e);
    } finally {
      setIsLoadingCards(false);
    }
  };

  const handleSaveSettings = (newSettings: FlashcardSettings) => {
    // User clicked "Start Session" in modal which calls onSave
    handleStartSession(newSettings);
  };

  const startSession = async () => {
    if (!settings) {
      setShowSettings(true);
      return;
    }
    handleStartSession(settings);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-primary-purple to-secondary-purple relative overflow-hidden">
        <FloatingElements />

        <ProductsHeader title={"Flashcards Session"} subtitle={"Personalized learning experience"} />

        {/* Main Content */}
        <div className="relative z-10 px-6 pb-6">
          <div className="max-w-4xl mx-auto">

            {/* Configuration Status */}
            <Card className="bg-background/10 backdrop-blur-sm border-white/20 mb-6">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-primary-foreground">
                        Configuration Status
                      </h2>
                      <p className="text-primary-foreground/80 text-sm">
                        {settings ? "Ready to start" : "Configure your flashcards"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-background/10 backdrop-blur-sm border-white/20">
                <div className="p-4 text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Settings className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Customize</h3>
                  <p className="text-white/60 text-sm mb-3">
                    Configure word types, display modes, and input methods
                  </p>
                  <Button
                    onClick={() => setShowSettings(true)}
                    variant="outline"
                    size="sm"
                    className="border-primary-purple/30 text-primary-purple hover:bg-primary-purple/10 dark:border-white/30 dark:text-white dark:hover:bg-white/10"
                  >
                    Configure
                  </Button>
                </div>
              </Card>

              <Card className="bg-background/10 backdrop-blur-sm border-white/20">
                <div className="p-4 text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Play className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Practice</h3>
                  <p className="text-white/60 text-sm mb-3">
                    Start a personalized learning session
                  </p>
                  <Button
                    onClick={startSession}
                    disabled={isLoadingCards}
                    variant="outline"
                    size="sm"
                    className="border-green-500/30 text-green-600 hover:bg-green-500/10 dark:border-white/30 dark:text-white dark:hover:bg-white/10 disabled:opacity-50"
                  >
                    {isLoadingCards ? "Loading..." : "Start Session"}
                  </Button>
                </div>
              </Card>

              <Card className="bg-background/10 backdrop-blur-sm border-white/20">
                <div className="p-4 text-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Track Progress</h3>
                  <p className="text-white/60 text-sm mb-3">
                    View detailed analytics and performance metrics
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-purple-500/30 text-purple-600 hover:bg-purple-500/10 dark:border-white/30 dark:text-white dark:hover:bg-white/10"
                  >
                    View Stats
                  </Button>
                </div>
              </Card>
            </div>

          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <FlashcardSettingsModal
            onClose={() => setShowSettings(false)}
            onSave={handleSaveSettings}
            initialSettings={settings || undefined}
          />
        )}
      </div>
    </AuthGuard>
  );
}
