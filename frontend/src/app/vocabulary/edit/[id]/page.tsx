"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/common/auth";
import { FloatingElements } from "@/components/common/layout/background";
import { NavigationHeader } from "@/components/common/layout/navigation/navigation-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { wordsApiClient } from "@/api/private/words/api-client";
import { Word } from "@/entities/word";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { WordForm, WordFormData, Segment } from "@/app/vocabulary/components/WordForm";


export default function VocabularyEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const isNew = id === "new";
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [initialData, setInitialData] = useState<WordFormData | undefined>(undefined);

    useEffect(() => {
        if (!isNew) {
            fetchWord(id);
        }
    }, [id, isNew]);

    const fetchWord = async (id: string) => {
        setIsLoading(true);
        try {
            const res = await wordsApiClient.getWord(id);
            if (res.success && res.data) {
                const w = res.data;
                
                // Reconstruct segments from parallel arrays
                const segments: Segment[] = [];
                if (w.reading.kanji_split && w.reading.kana_split && w.reading.kanji_split_type) {
                    w.reading.kanji_split.forEach((k, i) => {
                         segments.push({
                             kanji: k,
                             kana: w.reading.kana_split?.[i] || "",
                             type: w.reading.kanji_split_type?.[i] || "kanji"
                         });
                    });
                }

                // Map English string array to object array for useFieldArray
                const englishObjs = w.reading.english?.map(e => ({ value: e })) || [];

                setInitialData({
                    surface: w.surface || "",
                    level: {
                        jlpt: w.level?.jlpt || "N5",
                        custom: typeof w.level?.custom === 'string' ? parseInt(w.level.custom) : w.level?.custom
                    },
                    reading: {
                        kanji: w.reading.kanji || "",
                        kana: w.reading.kana || "",
                        english: englishObjs,
                        romaji: w.reading.romaji || []
                    },
                    segments: segments,
                    part_of_speech: w.part_of_speech || [],
                    category: w.category || []
                });
            } else {
                toast.error("Failed to load word");
                router.push("/flashcards");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error loading word");
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data: WordFormData) => {
        setIsSaving(true);
        try {
            // Deconstruct segments back to arrays
            const kanji_split: string[] = [];
            const kana_split: string[] = [];
            const kanji_split_type: string[] = [];

            data.segments.forEach(s => {
                kanji_split.push(s.kanji);
                kana_split.push(s.kana);
                kanji_split_type.push(s.type);
            });

            // Flatten English objects back to strings
            const englishStrings = data.reading.english.map(e => e.value).filter(v => v.trim() !== "");

            const payload: Partial<Word> = {
                id: isNew ? undefined : parseInt(id),
                surface: data.surface,
                level: {
                    ...data.level,
                    // Ensure custom is integer if present
                    custom: data.level.custom ? Number(data.level.custom) : undefined
                },
                part_of_speech: data.part_of_speech,
                category: data.category,
                reading: {
                    ...data.reading,
                    english: englishStrings,
                    kanji_split,
                    kana_split,
                    kanji_split_type
                }
            };

            const res = await wordsApiClient.saveWord(payload);
            if (res.success) {
                toast.success(isNew ? "Word created!" : "Word updated!");
            } else {
                toast.error(res.error || "Failed to save");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error saving word");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AuthGuard>
             <div className="min-h-screen bg-gradient-to-br from-primary-purple to-secondary-purple relative overflow-hidden flex flex-col">
                <FloatingElements />
                <NavigationHeader />
                <div className="relative z-10 pt-24 px-6 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">{isNew ? "New Word" : "Edit Word"}</h1>
                    <p className="text-white/80">{isNew ? "Add to your vocabulary" : "Update word details"}</p>
                </div>

                <div className="relative z-10 px-6 pb-6 flex-1 overflow-auto">
                    <div className="max-w-4xl mx-auto mt-6">
                        <Button 
                            variant="ghost" 
                            className="text-white/80 hover:text-white hover:bg-white/10 mb-4 pl-0"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>

                        <Card className="bg-background/20 backdrop-blur-md border-white/20 p-6">
                            {isLoading ? (
                                <div className="text-white text-center py-10">Loading...</div>
                            ) : (
                                <WordForm 
                                    initialData={initialData}
                                    onSubmit={onSubmit}
                                    isSaving={isSaving}
                                    onCancel={() => router.back()}
                                />
                            )}
                        </Card>
                    </div>
                </div>
             </div>
        </AuthGuard>
    );
}
