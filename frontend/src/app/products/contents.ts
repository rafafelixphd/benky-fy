// contents.ts
import {
    Brain,
    MessageSquare,
    FileText,
    GraduationCap,
    LucideIcon,
} from "lucide-react";

type ModuleStatus = "Available" | "Mock Up" | "Coming Soon";

interface LearningModule {
    id: string;
    name: string;
    description: string;
    status: ModuleStatus;
    icon: LucideIcon;
    color: string;
}

export const learningModules: LearningModule[] = [
    {
        id: "lessons",
        name: "Lessons",
        description: "Structured Japanese lessons with grammar and vocabulary",
        status: "Available",
        icon: GraduationCap,
        color: "from-blue-500 to-blue-600",
    },
    {
        id: "flashcards",
        name: "Flashcards",
        description: "Practice with interactive flashcards",
        status: "Available",
        icon: Brain,
        color: "from-green-500 to-green-600",
    },
    {
        id: "tokenizer",
        name: "Tokenizer",
        description: "Tokenize any sentence",
        status: "Available",
        icon: FileText,
        color: "from-green-500 to-green-600",
    },
    {
        id: "kanjistrikes",
        name: "Kanji Strikes",
        description: "Practice your kanji writing",
        status: "Coming Soon",
        icon: FileText,
        color: "from-green-500 to-green-600",
    },
    {
        id: "conversation",
        name: "AI Tutor Chat",
        description: "Chat with AI tutors for personalized help",
        status: "Available",
        icon: MessageSquare,
        color: "from-orange-500 to-orange-600",
    },
    {
        id: "sentences",
        name: "Sentences Practice",
        description: "Practice with real Japanese sentences",
        status: "Mock Up",
        icon: FileText,
        color: "from-purple-500 to-purple-600",
    },
];
