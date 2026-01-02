"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/common/auth";
import { NavigationHeader } from "@/components/common/layout/navigation/navigation-header";
import { FloatingElements } from "@/components/common/layout/background";
import { Card } from "@/components/ui/card";
import { WordForm, WordFormData } from "@/app/vocabulary/components/WordForm";
import { wordsApiClient } from "@/api/private/words/api-client";
import { toast } from "sonner";
import { useState } from "react";
import { Word } from "@/entities/word";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreateWordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const surface = searchParams.get("surface") || "";
  const lemma = searchParams.get("lemma") || "";
  const [isSaving, setIsSaving] = useState(false);

  // Pre-fill data from tokenizer params
  const initialData: WordFormData = {
      surface: surface,
      level: { jlpt: "N5" },
      reading: { 
          kanji: surface, 
          kana: lemma, 
          english: [], 
          romaji: [] 
      },
      segments: [],
      part_of_speech: [],
      category: []
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
                surface: data.surface,
                level: {
                    ...data.level,
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
                toast.success("Word created!");
                if (res.data?.id) {
                     router.push(`/vocabulary/edit/${res.data.id}`);
                } else {
                     router.push("/vocabulary");
                }
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
            <h1 className="text-3xl font-bold text-white mb-2">New Word</h1>
            <p className="text-white/80">Add to your vocabulary</p>
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
                <WordForm 
                    initialData={initialData} 
                    onSubmit={onSubmit} 
                    isSaving={isSaving}
                    onCancel={() => router.back()}
                />
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
