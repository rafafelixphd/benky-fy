import {
    BookOpen,
    Award,
    TrendingUp,
    Clock,
    LucideIcon
} from "lucide-react";

export interface DashboardStats {
    studyTime: string;
    cardsReviewed: number;
    accuracy: number;
    streakDays: number;
}

export interface ActivityItem {
    module: string;
    action: string;
    time: string;
    accuracy: number;
}

export interface WeeklyProgressItem {
    day: string;
    cards: number;
    accuracy: number;
}

export interface ModuleProgress {
    id: string;
    name: string;
    progress: number;
    lastStudied: string;
}

export const dashboardData = {
    todayStats: {
        studyTime: "2 hours 30 minutes",
        cardsReviewed: 45,
        accuracy: 87,
        streakDays: 12,
    },
    recentActivity: [
        {
            module: "Hiragana",
            action: "Completed 20 cards",
            time: "2 hours ago",
            accuracy: 90,
        },
        {
            module: "Numbers",
            action: "Reviewed 15 cards",
            time: "1 day ago",
            accuracy: 85,
        },
        {
            module: "Time",
            action: "Started new session",
            time: "2 days ago",
            accuracy: 78,
        },
    ],
    weeklyProgress: [
        { day: "Mon", cards: 25, accuracy: 88 },
        { day: "Tue", cards: 30, accuracy: 92 },
        { day: "Wed", cards: 20, accuracy: 85 },
        { day: "Thu", cards: 35, accuracy: 90 },
        { day: "Fri", cards: 28, accuracy: 87 },
        { day: "Sat", cards: 22, accuracy: 89 },
        { day: "Sun", cards: 18, accuracy: 91 },
    ],
};

export const recentModules: ModuleProgress[] = [
    {
        id: "hiragana",
        name: "Hiragana",
        progress: 75,
        lastStudied: "2 hours ago",
    },
    { id: "katakana", name: "Katakana", progress: 20, lastStudied: "3 days ago" },
    {
        id: "colors_basic",
        name: "Colors",
        progress: 60,
        lastStudied: "1 day ago",
    },
];

export const getStatsConfig = (data: typeof dashboardData.todayStats) => [
    {
        label: "Study Time Today",
        value: data.studyTime,
        icon: Clock,
        color: "text-purple-500",
    },
    {
        label: "Cards Reviewed",
        value: data.cardsReviewed.toString(),
        icon: BookOpen,
        color: "text-blue-500",
    },
    {
        label: "Accuracy Rate",
        value: `${data.accuracy}%`,
        icon: Award,
        color: "text-orange-500",
    },
    {
        label: "Current Streak",
        value: `${data.streakDays} days`,
        icon: TrendingUp,
        color: "text-green-500",
    },
];
