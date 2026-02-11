import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { SessionStats } from "@/api/private/words/api-client";

interface FlashcardResultProps {
    stats: SessionStats | null;
    onExit: () => void;
}

export function FlashcardResult({ stats, onExit }: FlashcardResultProps) {
    return (
        <Card className="w-full max-w-xl mx-auto p-12 text-center bg-background/20 backdrop-blur-md border-white/20 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                    <Check className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Session Complete!</h2>
                <p className="text-white/60 mb-6">You have reviewed all the cards in this session.</p>
                
                {stats && (
                    <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8 animate-in slide-in-from-bottom-2">
                         <div className="bg-white/10 rounded-lg p-3">
                            <div className="text-2xl font-bold text-white">{stats.total_cards}</div>
                            <div className="text-xs text-white/60 uppercase">Total Cards</div>
                         </div>
                         <div className="bg-green-500/20 rounded-lg p-3">
                            <div className="text-2xl font-bold text-green-400">{stats.correct}</div>
                            <div className="text-xs text-green-400/80 uppercase">Correct</div>
                         </div>
                         <div className="bg-red-500/20 rounded-lg p-3">
                            <div className="text-2xl font-bold text-red-400">{stats.incorrect}</div>
                            <div className="text-xs text-red-400/80 uppercase">Incorrect</div>
                         </div>
                         <div className="bg-blue-500/20 rounded-lg p-3">
                            <div className="text-2xl font-bold text-blue-400">{stats.half}</div>
                            <div className="text-xs text-blue-400/80 uppercase">Partial</div>
                         </div>
                         <div className="bg-yellow-500/20 rounded-lg p-3">
                            <div className="text-2xl font-bold text-yellow-400">{stats.gave_up}</div>
                            <div className="text-xs text-yellow-400/80 uppercase">Gave Up</div>
                         </div>
                    </div>
                )}

                <Button onClick={onExit} size="lg" className="bg-white/20 hover:bg-white/30 text-white min-w-[200px]">
                    Return to Menu
                </Button>
            </div>
        </Card>
    );
}
