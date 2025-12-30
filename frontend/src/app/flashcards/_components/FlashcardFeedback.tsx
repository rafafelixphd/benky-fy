import { Check, X, AlertCircle } from "lucide-react";
import { InputMode } from "@/entities/flashcards/settings";

export type FeedbackStatus = 'correct' | 'incorrect' | 'close';

export interface FeedbackItem {
    mode: string;
    userInput: string;
    correctValues: string[];
    status: FeedbackStatus;
}

interface FlashcardFeedbackProps {
    items: FeedbackItem[];
    className?: string;
}

export function FlashcardFeedback({ items, className = "" }: FlashcardFeedbackProps) {
    const getStatusColor = (status: FeedbackStatus) => {
        switch (status) {
            case 'correct': return 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20';
            case 'close': return 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20';
            case 'incorrect': return 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20';
            default: return 'bg-white/10 border-white/20';
        }
    };

    const getIcon = (status: FeedbackStatus) => {
        switch (status) {
            case 'correct': return <Check className="w-5 h-5 text-green-400" />;
            case 'close': return <AlertCircle className="w-5 h-5 text-orange-400" />;
            case 'incorrect': return <X className="w-5 h-5 text-red-400" />;
        }
    };

    const getStatusLabel = (status: FeedbackStatus) => {
        switch (status) {
            case 'correct': return <span className="text-xs text-green-200 bg-green-500/20 px-2 py-0.5 rounded">Correct</span>;
            case 'close': return <span className="text-xs text-orange-200 bg-orange-500/20 px-2 py-0.5 rounded">Close</span>;
            case 'incorrect': return <span className="text-xs text-red-200 bg-red-500/20 px-2 py-0.5 rounded">Incorrect</span>;
        }
    };

    return (
        <div className={`grid gap-4 ${className}`}>
            {items.map((item, index) => (
                <div
                    key={`${item.mode}-${index}`}
                    className={`relative p-4 rounded-lg border transition-all duration-200 backdrop-blur-sm ${getStatusColor(item.status)}`}
                >
                    <div className="flex items-start justify-between mb-2">
                        <span className="text-xs uppercase tracking-wider text-white/60 font-medium">
                            {item.mode}
                        </span>
                        <div className="flex items-center gap-2">
                            {getStatusLabel(item.status)}
                            {getIcon(item.status)}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-white/40 mb-1">Your Answer</p>
                            <p className="text-lg text-white font-medium">
                                {item.userInput || <span className="text-white/20 italic">Empty</span>}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-white/40 mb-1">Correct Answer</p>
                            <p className="text-lg text-white/90">
                                {item.correctValues.join(", ")}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
