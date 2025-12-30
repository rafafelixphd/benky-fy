import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { wordsApiClient } from "@/api/private/words/api-client";
import { Word } from "@/entities/word";
import { Sparkles } from "lucide-react";

export function Flashcard({ onExit }: { onExit: () => void }) {
    const [word, setWord] = useState<Word | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);

    const fetchWord = async () => {
        setLoading(true);
        setError(null);
        setShowAnswer(false);
        try {
            const response = await wordsApiClient.getRandomWord();
            if (response.success && response.data) {
                setWord(response.data);
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
                    <>
                        <div className="text-center space-y-6">
                            {/* Kanji / Main Display */}
                            <div>
                                <p className="text-sm text-white/60 mb-2 uppercase tracking-wider">
                                    {word.level?.jlpt || "Word"}
                                </p>
                                <h1 className="text-6xl font-bold text-white mb-4">
                                    {(word.reading as any).kanji?.[0] || (word.reading as any).kana?.[0] || "?"}
                                </h1>
                                {/* Furigana/Reading - always show or toggle? let's show kana if different */}
                                {(word.reading as any).kanji?.[0] && (
                                    <p className="text-2xl text-white/80">
                                        {(word.reading as any).kana?.[0]}
                                    </p>
                                )}
                            </div>

                            {/* Answer Section */}
                            {showAnswer && (
                                <div className="pt-8 border-t border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <p className="text-3xl text-green-400 font-medium">
                                        {(word.reading as any).english?.[0]}
                                    </p>
                                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                                        {word.part_of_speech?.map((pos, i) => (
                                            <span key={i} className="px-2 py-1 rounded-full bg-white/10 text-xs text-white/70">
                                                {pos}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
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
                    <Button
                        size="lg"
                        onClick={() => setShowAnswer(true)}
                        className="bg-white/20 hover:bg-white/30 text-white min-w-[150px]"
                    >
                        Show Answer
                    </Button>
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
