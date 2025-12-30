"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/common/auth";
import { FloatingElements } from "@/components/common/layout/background";
import { ProductsHeader } from "@/components/layout/header";
import { Flashcard } from "../_components/Flashcard";
import { FlashcardSettings } from "@/entities/flashcards/settings";

export default function PracticePage() {
    const router = useRouter();
    const [settings, setSettings] = useState<FlashcardSettings | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('flashcard-settings');
            if (saved) {
                try {
                    setSettings(JSON.parse(saved));
                } catch (e) {
                    console.error("Failed to parse settings", e);
                }
            }
        }
    }, []);

    const handleExit = () => {
        router.push("/flashcards");
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-gradient-to-br from-primary-purple to-secondary-purple relative overflow-hidden">
                <FloatingElements />

                <ProductsHeader title={"Practice Session"} subtitle={"Focused learning"} />

                <div className="relative z-10 px-6 pb-6 mt-8">
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                        {settings && <Flashcard onExit={handleExit} settings={settings} />}
                        {!settings && (
                            <div className="text-white text-center">Loading settings...</div>
                        )}
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
