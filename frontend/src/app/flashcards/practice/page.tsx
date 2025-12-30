"use client";

import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/common/auth";
import { FloatingElements } from "@/components/common/layout/background";
import { ProductsHeader } from "@/components/layout/header";
import { Flashcard } from "../_components/Flashcard";

export default function PracticePage() {
    const router = useRouter();

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
                        <Flashcard onExit={handleExit} />
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
