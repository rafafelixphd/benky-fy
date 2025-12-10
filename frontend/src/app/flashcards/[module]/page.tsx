"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Menu } from "lucide-react";
import { useParams } from "next/navigation";
import { useRandomWord, useTrackAnswer, AnswerResult } from "@/core/hooks";
import { validateAnswer } from "@/core/validation";
import { useSettingsStore } from "@/core/settings-store";
import { FlashcardDisplay } from "@/components/flashcard/core/display";
import { AnswerInput } from "@/components/flashcard/core/input";
import { ProgressSection } from "@/components/flashcard/core/progress";
import { SettingsModal } from "@/components/flashcard/core/settings";
import { FloatingFeedback } from "@/components/flashcard/core/feedback";
import { HelpModal } from "@/components/flashcard/core/help";
import { Statistics } from "@/components/flashcard/core/stats";
import { NavigationHeader } from "@/components/common/layout/navigation";
import { MobileMenu } from "@/components/ui/mobile-menu";
import { Button } from "@/components/ui/button";
import { Loader2, Settings, HelpCircle, BarChart3 } from "lucide-react";

export default function FlashcardPage() {
  const params = useParams();
  const moduleName = params?.module as string;

  const [currentItemId, setCurrentItemId] = useState(1);
  const [isUserInteraction, setIsUserInteraction] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [currentMode, setCurrentMode] = useState<"flashcard">("flashcard");
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [currentAttempts, setCurrentAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [lastAnswer, setLastAnswer] = useState("");
  const [lastMatchedType, setLastMatchedType] = useState<string | undefined>();
  const [lastConvertedAnswer, setLastConvertedAnswer] = useState<
    string | undefined
  >();
  const [testedWord, setTestedWord] = useState<any>(null); // Store the word being tested
  const [showFloatingFeedback, setShowFloatingFeedback] = useState(false);
  const [lastValidationResult, setLastValidationResult] = useState<any>(null);
  const [lastUserAnswers, setLastUserAnswers] = useState<
    Record<string, string>
  >({});
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    data: randomWord,
    isLoading: isRandomLoading,
    error: randomError,
    refetch: refetchRandomWord,
  } = useRandomWord(moduleName);
  const { getSettings } = useSettingsStore();
  const trackAnswerMutation = useTrackAnswer();

  const settings = getSettings(moduleName);

  // Unified navigation function for all modules - all use random API
  const navigateToNext = useCallback(() => {
    refetchRandomWord();
  }, [refetchRandomWord]);

  const navigateToPrevious = useCallback(() => {
    refetchRandomWord(); // For random mode, "previous" means new random word
  }, [refetchRandomWord]);

  // Manual advance function that clears timer and resets state
  const manualAdvance = useCallback(() => {
    // Clear any pending auto-advance timer
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    // Navigate to next item
    navigateToNext();

    // Reset state for next item
    setCurrentAttempts(0);
    setIsCorrect(false);
    setIsUserInteraction(false);
    setTestedWord(null);
  }, [navigateToNext]);

  // All modules now use random word selection
  const currentItem = randomWord;
  const isLoadingData = isRandomLoading;

  // Use testedWord for validation/feedback, currentItem for display
  const itemForValidation = testedWord || currentItem;
  const dataError = randomError;

  const handleAnswerSubmit = useCallback(
    async (
      userAnswer:
        | string
        | {
            english: string;
            hiragana: string;
            katakana?: string;
            kanji?: string;
            romaji?: string;
          },
      serverValidationResult?: any,
    ) => {
      if (!currentItem) return;

      // // Set the word being tested (only once per word)
      // if (!testedWord) {
      //   setTestedWord(currentItem);
      // }

      setIsUserInteraction(true);

      // Prepare correct answers for validation using the tested word
      const correctAnswers = {
        hiragana: itemForValidation.hiragana,
        katakana: itemForValidation.katakana,
        english: itemForValidation.english,
        kanji: itemForValidation.kanji,
      };

      // Use comprehensive validation (frontend fallback)
      const validationResult = validateAnswer(
        userAnswer,
        correctAnswers,
        settings,
        moduleName,
      );
      const answerIsCorrect =
        serverValidationResult?.is_correct ?? validationResult.isCorrect;
      // Store answer information for feedback
      const answerString =
        typeof userAnswer === "string"
          ? userAnswer
          : `${userAnswer.hiragana || ""} / ${userAnswer.english || ""}`.replace(
              / \/ $/,
              "",
            );
      setLastAnswer(answerString);
      setLastMatchedType(validationResult.matchedType);
      setLastConvertedAnswer(validationResult.convertedAnswer);
      setLastValidationResult(validationResult);

      // Store individual user answers for floating feedback
      if (typeof userAnswer === "object") {
        setLastUserAnswers({
          hiragana: userAnswer.hiragana || "",
          katakana: userAnswer.katakana || "",
          english: userAnswer.english || "",
          kanji: userAnswer.kanji || "",
          romaji: userAnswer.romaji || "",
        });
      } else {
        // For single input, determine which field was used based on matched type
        const singleAnswer = {
          hiragana: "",
          katakana: "",
          english: "",
          kanji: "",
          romaji: "",
        };
        if (validationResult.matchedType) {
          singleAnswer[
            validationResult.matchedType as keyof typeof singleAnswer
          ] = userAnswer;
        }
        setLastUserAnswers(singleAnswer);
      }

      // Update attempt counter
      const newAttempts = currentAttempts + 1;
      setCurrentAttempts(newAttempts);
      setIsCorrect(answerIsCorrect);

      // Track answer result for future database storage
      const answerResult: AnswerResult = {
        moduleName,
        itemId: itemForValidation.id,
        userAnswer: answerString,
        isCorrect: answerIsCorrect,
        matchedType: validationResult.matchedType,
        timerDuration: validationResult.timerDuration,
        attempts: newAttempts,
        timestamp: new Date().toISOString(),
        settings: {
          input_hiragana: settings.input_hiragana,
          input_katakana: settings.input_katakana,
          input_english: settings.input_english,
          input_kanji: settings.input_kanji,
          input_romaji: settings.input_romaji,
          display_mode: settings.display_mode,
          furigana_style: settings.furigana_style,
        },
      };

      // Console log detailed comparison table
      setShowFloatingFeedback(true);
    },
    [currentItem, currentAttempts, settings, navigateToNext],
  );

  // Handle floating feedback close and advance
  const handleFloatingFeedbackClose = useCallback(() => {
    setShowFloatingFeedback(false);
    // Move to next item
    navigateToNext();
    // Reset state for next item
    setIsCorrect(false);
    setIsUserInteraction(false);
    setTestedWord(null);
    setLastUserAnswers({});
  }, [navigateToNext]);

  useEffect(() => {
    if (randomWord && !isPageLoaded) {
      setIsPageLoaded(true);
    }
  }, [randomWord, isPageLoaded]);

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-purple to-secondary-purple">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-foreground" />
          <p className="text-primary-foreground">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-purple to-secondary-purple">
        <div className="text-center">
          <p className="text-primary-foreground mb-4">
            Error loading flashcards
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-purple to-secondary-purple">
        <div className="text-center">
          <p className="text-primary-foreground">No flashcards available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-purple to-secondary-purple relative overflow-hidden">
      {/* Navigation Header */}
      <NavigationHeader currentPage={`/flashcards/${moduleName}`} />

      {/* Debug Component - Console Only */}

      {/* Page Content */}
      <div className="pt-16">
        {/* Module Header */}
        <div className="relative z-10 p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-primary-foreground capitalize">
              {moduleName} Flashcards
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {/* Mobile Menu */}
            <div className="sm:hidden">
              <MobileMenu
                items={[
                  {
                    icon: BarChart3,
                    label: "Statistics",
                    onClick: () => {
                      setShowStats(true);
                    },
                  },
                  {
                    icon: HelpCircle,
                    label: "Help",
                    onClick: () => setShowHelp(true),
                  },
                  ...(currentMode === "flashcard"
                    ? [
                        {
                          icon: Settings,
                          label: "Settings",
                          onClick: () => setShowSettings(true),
                        },
                      ]
                    : []),
                ]}
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary-purple/30 text-primary-purple hover:bg-primary-purple/10 min-h-[44px] w-full flex items-center justify-center gap-2"
                  >
                    <Menu className="w-5 h-5" />
                    <span>Options</span>
                  </Button>
                }
              />
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStats(true)}
                className="border-primary-purple/30 text-primary-purple hover:bg-primary-purple/10"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Statistics
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHelp(true)}
                className="border-primary-purple/30 text-primary-purple hover:bg-primary-purple/10"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </Button>
              {currentMode === "flashcard" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="border-primary-purple/30 text-primary-purple hover:bg-primary-purple/10"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
          <div className="w-full max-w-4xl">
            {/* Progress Section */}
            {/* <ProgressSection
              currentItem={1}
              totalItems={1}
              moduleName={moduleName}
            /> */}

            {/* Flashcard Display */}
            <FlashcardDisplay
              item={currentItem}
              settings={settings}
              isUserInteraction={isUserInteraction}
              mode={currentMode}
            />

            {/* Answer Input */}
            <AnswerInput
              onSubmit={handleAnswerSubmit}
              onAdvance={manualAdvance}
              disabled={isUserInteraction}
              settings={settings}
              isCorrect={isCorrect}
              currentItem={itemForValidation}
              lastAnswer={lastAnswer}
              lastMatchedType={lastMatchedType}
              lastConvertedAnswer={lastConvertedAnswer}
              moduleName={moduleName}
              enableServerValidation={false}
              enableRealtimeFeedback={false}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSettings && (
        <SettingsModal
          moduleName={moduleName}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showHelp && (
        <HelpModal
          moduleName={moduleName}
          currentItemId={currentItemId}
          onClose={() => setShowHelp(false)}
        />
      )}

      {showStats && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Statistics
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStats(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
              <Statistics
                moduleName={moduleName}
                onClose={() => setShowStats(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Feedback Modal */}
      {showFloatingFeedback && currentItem && (
        <FloatingFeedback
          item={currentItem}
          userAnswer={lastAnswer}
          isCorrect={isCorrect}
          matchedType={lastMatchedType}
          convertedAnswer={lastConvertedAnswer}
          settings={settings}
          frontendValidationResult={lastValidationResult}
          userAnswers={lastUserAnswers}
          moduleName={moduleName}
          timerDuration={lastValidationResult?.timerDuration ?? 10_000}
          onClose={handleFloatingFeedbackClose}
        />
      )}
    </div>
  );
}
