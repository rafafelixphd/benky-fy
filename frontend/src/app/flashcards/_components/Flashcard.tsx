import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { wordsApiClient } from "@/api/private/words/api-client";
import { Word } from "@/entities/word";
import { FlashcardSettings, InputMode } from "@/entities/flashcards/settings";
import { Check, X } from "lucide-react";
import { RomajiInput } from "@/components/japanese/romaji";
import { convertInputForField } from "@/lib/utils/romaji-conversion";
import { FlashcardFeedback, FeedbackItem, FeedbackStatus } from "./FlashcardFeedback";

interface FlashcardProps {
    onExit: () => void;
    settings: FlashcardSettings;
}

export function Flashcard({ onExit, settings }: FlashcardProps) {
    const [word, setWord] = useState<Word | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [gaveUp, setGaveUp] = useState(false);

    // Input state - mapped by InputMode
    const [userInputs, setUserInputs] = useState<Record<string, string>>({});
    const [inputFeedbacks, setInputFeedbacks] = useState<Record<string, 'correct' | 'incorrect'>>({});
    const [attempts, setAttempts] = useState(0);

    const MAX_ATTEMPTS = 2;

    // Refs for focus management
    const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const isViewOnly = settings.display.inputMode === 'view-only';
    const activeModes = !isViewOnly ? (settings.display.inputMode as InputMode[]) : [];

    const fetchWord = async () => {
        setLoading(true);
        setError(null);
        setShowAnswer(false);

        setGaveUp(false);
        setAttempts(0);
        setUserInputs({});
        setInputFeedbacks({});

        try {
            const response = await wordsApiClient.getNextWord();
            if (response.success && response.data) {
                setWord(response.data);
                if (!isViewOnly) {
                    // Auto-focus input on new word (needs slight delay for render)
                    setTimeout(() => {
                        const firstMode = activeModes[0];
                        inputRefs.current[firstMode]?.focus();
                    }, 100);
                }
            } else {
                setError(response.error || "Failed to fetch word");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWord();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent, mode: string) => {
        if (e.key === 'Enter') {
            if (showAnswer) {
                fetchWord();
            } else {
                handleCheckAnswer(false);
            }
        }
    };

    const handleCheckAnswer = (isGiveUp = false) => {
        if (!word) return;

        const newFeedbacks: Record<string, 'correct' | 'incorrect'> = {};
        let allCorrect = true;

        activeModes.forEach(mode => {
            let inputVal = (userInputs[mode] || "").trim().toLowerCase();

            // For 'kana' mode, if the input is Romaji, convert it to Hiragana for validation
            if (mode === 'kana') {
                const conversion = convertInputForField(inputVal, "hiragana");
                inputVal = conversion.converted;
            }

            let handlerValidateAnswer: string[] = [];

            // Get valid answers for THIS specific mode
            // Get valid answers for THIS specific mode
            if (mode === 'english') {
                handlerValidateAnswer = word.reading.english || [];
            } else if (mode === 'romaji') {
                handlerValidateAnswer = word.reading.romaji || [];
            } else if (mode === 'kana') {
                handlerValidateAnswer = word.reading.kana ? [word.reading.kana] : [];
            } else if (mode === 'kanji') {
                handlerValidateAnswer = word.reading.kanji ? [word.reading.kanji] : [];
            }

            const isCorrect = handlerValidateAnswer.some(ans => ans.toLowerCase() === inputVal);

            if (isCorrect) {
                newFeedbacks[mode] = 'correct';
            } else {
                newFeedbacks[mode] = 'incorrect';
                allCorrect = false;
            }
        });

        setInputFeedbacks(newFeedbacks);

        if (allCorrect || isGiveUp) {
            if (isGiveUp) setGaveUp(true);
            setShowAnswer(true);
        } else {
            const nextAttempts = attempts + 1;
            setAttempts(nextAttempts);
            if (nextAttempts >= MAX_ATTEMPTS) {
                setShowAnswer(true);
            }
        }
    };

    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                e.preventDefault();
                if (showAnswer) {
                    fetchWord();
                } else {
                    handleCheckAnswer(false);
                }
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [handleCheckAnswer]);



    const getPrimaryDisplay = () => {
        if (!word) return "?";
        switch (settings.display.cardDisplay) {
            case 'english':
                return word.reading.english?.join(", ") || "?";
            case 'kana':
                return word.reading.kana || "?";
            case 'kanji':
            default:
                const kanjiText = word.reading.kanji;
                return kanjiText ? kanjiText : (word.reading.kana || "?");
        }
    };

    if (loading && !word) {
        return (
            <Card className="w-full max-w-xl mx-auto p-12 text-center bg-background/20 backdrop-blur-md border-white/20">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-4 w-32 bg-white/20 rounded mb-4"></div>
                    <div className="h-16 w-48 bg-white/20 rounded mb-8"></div>
                    <div className="h-4 w-40 bg-white/20 rounded"></div>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="w-full max-w-xl mx-auto p-8 text-center bg-red-500/10 border-red-500/20">
                <p className="text-red-400 mb-4">{error}</p>
                <Button onClick={fetchWord} variant="outline" className="border-red-500/30 text-red-500 hover:bg-red-500/10">Try Again</Button>
            </Card>
        );
    }

    return (
        <div className="w-full max-w-xl mx-auto">
            <Card className="bg-background/20 backdrop-blur-md border-white/20 overflow-hidden relative min-h-[400px] flex flex-col justify-center items-center p-8">
                {word && (
                    <div className="text-center space-y-8 w-full">
                        {/* Word Display */}
                        <div>
                            <p className="text-sm text-white/60 mb-2 uppercase tracking-wider">
                                {word.level?.jlpt || "Word"}
                            </p>
                            <h1 className="text-6xl font-bold text-white mb-4">
                                {getPrimaryDisplay()}
                            </h1>

                            {/* Secondary Display (always show Kana if Kanji is main? Or obey settings strictly? 
                                Use case says 'Card display'. Usually means FRONT of card.
                                Back of card (Answer) should show everything or specific?
                                Let's assume Back shows full info.)
                            */}
                        </div>

                        {/* Input Area or View Only Control */}
                        {!isViewOnly && !showAnswer && (
                            <div className="w-full max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-4 space-y-4">
                                {activeModes.map((mode) => (
                                    <div key={mode} className="relative">
                                        <label className="text-xs text-white/50 block text-left mb-1 ml-1 capitalize">
                                            {mode}
                                        </label>
                                        <div className="relative">
                                            {mode === 'kana' ? (
                                                (() => {
                                                    const shouldUseKatakana = word?.reading?.katakana && word.reading.katakana.length > 0;
                                                    return (
                                                        <div className="relative">
                                                            <RomajiInput
                                                                value={userInputs[mode] || ""}
                                                                onChange={(e) => {
                                                                    const rawVal = e.target.value;
                                                                    // Convert immediately to mimic IME behavior
                                                                    const targetType = shouldUseKatakana ? "katakana" : "hiragana";
                                                                    const conversion = convertInputForField(rawVal, targetType);

                                                                    setUserInputs(prev => ({ ...prev, [mode]: conversion.converted }));

                                                                    if (inputFeedbacks[mode]) {
                                                                        setInputFeedbacks(prev => {
                                                                            const newFeedbacks = { ...prev };
                                                                            delete newFeedbacks[mode];
                                                                            return newFeedbacks;
                                                                        });
                                                                    }
                                                                }}
                                                                onKeyDown={(e) => handleKeyDown(e, mode)}
                                                                placeholder="Type romaji..."
                                                                outputType={shouldUseKatakana ? "katakana" : "hiragana"}
                                                                className={`
                                                                    w-full text-center text-lg h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30
                                                                    focus:ring-2 focus:ring-offset-0 transition-all
                                                                    ${inputFeedbacks[mode] === 'correct' ? 'border-green-500 focus:ring-green-500' : ''}
                                                                    ${inputFeedbacks[mode] === 'incorrect' ? 'border-red-500 focus:ring-red-500' : 'focus:ring-indigo-500'}
                                                                `}
                                                                showPreview={false}
                                                            />
                                                        </div>
                                                    );
                                                })()
                                            ) : (
                                                <Input
                                                    ref={el => { inputRefs.current[mode] = el }}
                                                    value={userInputs[mode] || ""}
                                                    onChange={(e) => {
                                                        setUserInputs(prev => ({ ...prev, [mode]: e.target.value }));
                                                        // Clear error on type for this field
                                                        if (inputFeedbacks[mode]) {
                                                            setInputFeedbacks(prev => {
                                                                const newFeedbacks = { ...prev };
                                                                delete newFeedbacks[mode];
                                                                return newFeedbacks;
                                                            });
                                                        }
                                                    }}
                                                    onKeyDown={(e) => handleKeyDown(e, mode)}
                                                    placeholder={`Type ${mode}...`}
                                                    className={`
                                                        bg-white/10 border-white/20 text-white placeholder:text-white/30 text-center text-lg h-12
                                                        focus:ring-2 focus:ring-offset-0 transition-all
                                                        ${inputFeedbacks[mode] === 'correct' ? 'border-green-500 focus:ring-green-500' : ''}
                                                        ${inputFeedbacks[mode] === 'incorrect' ? 'border-red-500 focus:ring-red-500' : 'focus:ring-indigo-500'}
                                                    `}
                                                />
                                            )}
                                            {inputFeedbacks[mode] === 'incorrect' && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 animate-in zoom-in pointer-events-none">
                                                    <X className="w-5 h-5" />
                                                </div>
                                            )}
                                            {inputFeedbacks[mode] === 'correct' && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 animate-in zoom-in pointer-events-none">
                                                    <Check className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <p className="text-xs text-white/40 mt-2">
                                    Press Enter to check
                                </p>
                            </div>
                        )}

                        {/* Answer Section */}
                        {showAnswer && (
                            <div className="pt-8 border-t border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                                {isViewOnly ? (
                                    <div className="grid grid-cols-2 gap-4 text-left max-w-xs mx-auto mb-6">
                                        <div>
                                            <p className="text-xs text-white/40">English</p>
                                            <p className="text-lg text-white">{word.reading.english?.join(", ")}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/40">Kanji</p>
                                            <p className="text-lg text-white">{word.reading.kanji || "-"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/40">Kana</p>
                                            <p className="text-lg text-white">{word.reading.kana}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/40">Romaji</p>
                                            <p className="text-lg text-white">{word.reading.romaji?.join("") || "-"}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-6">
                                        <FlashcardFeedback
                                            items={activeModes.map(mode => {
                                                let inputVal = (userInputs[mode] || "").trim().toLowerCase();
                                                // Convert logic repeated from validation for consistency (stored value is usually converted but let's be safe)
                                                // Actually userInputs for Kana IS converted in onChange.
                                                // Just need to determine status.

                                                let validAnswers: string[] = [];
                                                if (mode === 'english') {
                                                    validAnswers = word.reading.english || [];
                                                } else if (mode === 'romaji') {
                                                    validAnswers = word.reading.romaji || [];
                                                } else if (mode === 'kana') {
                                                    validAnswers = word.reading.kana ? [word.reading.kana] : [];
                                                } else if (mode === 'kanji') {
                                                    validAnswers = word.reading.kanji ? [word.reading.kanji] : [];
                                                }

                                                const isCorrect = validAnswers.some(ans => ans.toLowerCase() === inputVal);
                                                const status: FeedbackStatus = isCorrect ? 'correct' : 'incorrect';

                                                return {
                                                    mode,
                                                    userInput: userInputs[mode] || "", // Display what user typed (already converted for Kana)
                                                    correctValues: validAnswers,
                                                    status
                                                };
                                            })}
                                        />
                                    </div>
                                )}

                                <div className="flex flex-wrap justify-center gap-2">
                                    {word.part_of_speech?.map((pos, i) => (
                                        <span key={i} className="px-2 py-1 rounded-full bg-white/10 text-xs text-white/70">
                                            {pos}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {/* Controls */}
            <div className="mt-8 flex justify-center gap-4">
                <Button
                    variant="ghost"
                    onClick={onExit}
                    className="text-white/60 hover:text-white hover:bg-white/10"
                >
                    End Session
                </Button>

                {!showAnswer ? (
                    isViewOnly ? (
                        <Button
                            size="lg"
                            onClick={() => setShowAnswer(true)}
                            className="bg-white/20 hover:bg-white/30 text-white min-w-[150px]"
                        >
                            Show Answer
                        </Button>
                    ) : (
                        <div className="flex gap-4">
                            <Button
                                size="lg"
                                variant="secondary"
                                onClick={() => handleCheckAnswer(true)}
                                className="bg-white/10 hover:bg-white/20 text-white border-white/10"
                            >
                                Give Up
                            </Button>
                            <Button
                                size="lg"
                                onClick={() => handleCheckAnswer(false)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[150px]"
                            >
                                Check Answer
                            </Button>
                        </div>
                    )
                ) : (
                    <Button
                        size="lg"
                        onClick={fetchWord}
                        className="bg-green-500 hover:bg-green-600 text-white min-w-[150px]"
                    >
                        Next Word
                    </Button>
                )}
            </div>
        </div>
    );
}
