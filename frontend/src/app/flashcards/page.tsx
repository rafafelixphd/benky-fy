"use client";

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
import { FlashcardSettingsModal, type FlashcardSettingsModalProps } from "./settings/";
import { ProductsHeader } from "@/components/layout/header";

export default function CustomFlashcardPage() {
  const { data: authData } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<FlashcardSettingsModalProps | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionFlashcards, setSessionFlashcards] = useState<any[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoadingCards, setIsLoadingCards] = useState(false);

  const handleSaveSettings = (newSettings: FlashcardSettingsModalProps) => {
    setSettings(newSettings);
    setShowSettings(false);
  };

  const startSession = async () => {
    if (!settings) {
      setShowSettings(true);
      return;
    }

    setIsLoadingCards(true);
    setIsSessionActive(true);

    try {
      // Get enabled modules
      const enabledModules = settings.modules.filter(module => module.enabled);

      if (enabledModules.length === 0) {
        alert("Please select at least one module to start a session.");
        setIsSessionActive(false);
        setIsLoadingCards(false);
        return;
      }

      // Load flashcards from each enabled module
      const allFlashcards: any[] = [];

      for (const module of enabledModules) {
        try {
          const response = await fetch(`/api/v2/words/${module.id}`);
          if (response.ok) {
            const data = await response.json();
            const moduleCards = data.words || [];

            // Add module info to each card
            const cardsWithModule = moduleCards.map((card: any) => ({
              ...card,
              moduleId: module.id,
              moduleName: module.name,
              moduleWeight: module.weight,
            }));

            allFlashcards.push(...cardsWithModule);
          }
        } catch (error) {
          console.error(`Failed to load flashcards from ${module.name}:`, error);
        }
      }

      if (allFlashcards.length === 0) {
        alert("No flashcards found in the selected modules.");
        setIsSessionActive(false);
        setIsLoadingCards(false);
        return;
      }

      // Shuffle flashcards
      const shuffledCards = allFlashcards.sort(() => Math.random() - 0.5);

      setSessionFlashcards(shuffledCards);
      setCurrentCardIndex(0);

    } catch (error) {
      console.error("Failed to start session:", error);
      alert("Failed to start session. Please try again.");
      setIsSessionActive(false);
    } finally {
      setIsLoadingCards(false);
    }
  };

  const getEnabledWordTypes = () => {
    if (!settings) return [];
    return Object.entries(settings.wordTypes)
      .filter(([_, enabled]) => enabled)
      .map(([type, _]) => type);
  };

  const getEnabledDisplayModes = () => {
    if (!settings) return [];
    return Object.entries(settings.displayModes)
      .filter(([_, enabled]) => enabled)
      .map(([mode, _]) => mode);
  };

  const getEnabledInputModes = () => {
    if (!settings) return [];
    return Object.entries(settings.inputModes)
      .filter(([_, enabled]) => enabled)
      .map(([mode, _]) => mode);
  };

  const getCurrentCard = () => {
    if (sessionFlashcards.length === 0 || currentCardIndex >= sessionFlashcards.length) {
      return null;
    }
    return sessionFlashcards[currentCardIndex];
  };

  const nextCard = () => {
    if (currentCardIndex < sessionFlashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // Session complete
      setIsSessionActive(false);
      setSessionFlashcards([]);
      setCurrentCardIndex(0);
    }
  };

  const endSession = () => {
    setIsSessionActive(false);
    setSessionFlashcards([]);
    setCurrentCardIndex(0);
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
                        {settings ? "Ready to start" : "Configure your custom flashcards"}
                      </p>
                    </div>
                  </div>

                </div>

                {settings ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-2">Word Types</h4>
                      <div className="flex flex-wrap gap-1">
                        {getEnabledWordTypes().map((type) => (
                          <span
                            key={type}
                            className="px-2 py-1 bg-blue-500/20 text-blue-200 text-xs rounded"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-2">Display Modes</h4>
                      <div className="flex flex-wrap gap-1">
                        {getEnabledDisplayModes().map((mode) => (
                          <span
                            key={mode}
                            className="px-2 py-1 bg-green-500/20 text-green-200 text-xs rounded"
                          >
                            {mode}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-2">Input Modes</h4>
                      <div className="flex flex-wrap gap-1">
                        {getEnabledInputModes().map((mode) => (
                          <span
                            key={mode}
                            className="px-2 py-1 bg-purple-500/20 text-purple-200 text-xs rounded"
                          >
                            {mode}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60 mb-4">
                      Configure your custom flashcard settings to get started
                    </p>
                    <Button
                      onClick={() => setShowSettings(true)}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configure Settings
                    </Button>
                  </div>
                )}
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
                    disabled={!settings || isLoadingCards}
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
          />
        )}
      </div>
    </AuthGuard>
  );
}
