"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AuthGuard } from "@/components/common/auth";
import { FloatingElements } from "@/components/common/layout/background";
import { NavigationHeader } from "@/components/common/layout/navigation/navigation-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { wordsApiClient } from "@/api/private/words/api-client";
import { Word } from "@/entities/word";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner or similar toast lib is used, will check imports later if needed.

interface PageProps {
  params: {
    id: string;
  };
}

// Since Word entity is complex, let's shape our form data
interface WordFormData {
  surface: string;
  level: {
    jlpt: string;
    custom?: number;
  };
  reading: {
    kanji: string;
    kana: string; // Storing as string for simple editing, though arrays exist
    english: string[]; 
    romaji: string[];
  };
  part_of_speech: string[];
  category: string[];
}

export default function VocabularyEditPage({ params }: PageProps) {
    const router = useRouter();
    const isNew = params.id === "new";
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const { register, control, handleSubmit, reset, setValue, watch } = useForm<WordFormData>({
        defaultValues: {
            surface: "",
            level: { jlpt: "N5" },
            reading: { kanji: "", kana: "", english: [], romaji: [] },
            part_of_speech: [],
            category: []
        }
    });



    // Helper to handle array inputs for simple strings
    const [posInput, setPosInput] = useState("");
    
    useEffect(() => {
        if (!isNew) {
            fetchWord(params.id);
        }
    }, [params.id, isNew]);

    const fetchWord = async (id: string) => {
        setIsLoading(true);
        try {
            const res = await wordsApiClient.getWord(id);
            if (res.success && res.data) {
                const w = res.data;
                reset({
                    surface: w.surface,
                    level: {
                        jlpt: w.level?.jlpt || "N5",
                        custom: typeof w.level?.custom === 'string' ? parseInt(w.level.custom) : w.level?.custom
                    },
                    reading: {
                        kanji: w.reading.kanji || "",
                        kana: w.reading.kana || "",
                        english: w.reading.english || [],
                        romaji: w.reading.romaji || []
                    },
                    part_of_speech: w.part_of_speech || [],
                    category: w.category || []
                });
            } else {
                toast.error("Failed to load word");
                router.push("/flashcards"); // Fallback
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
            const payload: Partial<Word> = {
                id: isNew ? undefined : parseInt(params.id),
                surface: data.surface,
                level: data.level,
                part_of_speech: data.part_of_speech, // Should be managed via UI, currently basic
                category: data.category,
                reading: {
                    ...data.reading,
                    // Ensure splits are empty if not managed manually
                    kanji_split: [], kana_split: [], kanji_split_type: []
                }
            };

            const res = await wordsApiClient.saveWord(payload);
            if (res.success) {
                toast.success(isNew ? "Word created!" : "Word updated!");
                // Optionally redirect back or stay
                // router.back();
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
    
    const handleAddPos = () => {
        if (!posInput.trim()) return;
        const current = watch("part_of_speech") || [];
        setValue("part_of_speech", [...current, posInput.trim()]);
        setPosInput("");
    }

    const handleRemovePos = (index: number) => {
        const current = watch("part_of_speech") || [];
        setValue("part_of_speech", current.filter((_: string, i: number) => i !== index));
    }

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
                    <div className="max-w-3xl mx-auto mt-6">
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
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    {/* Basics */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-white">Surface Form (Kanji/Main)</Label>
                                            <Input 
                                                {...register("surface", { required: true })}
                                                className="bg-white/10 border-white/20 text-white" 
                                                placeholder="e.g. 新しい"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-white">JLPT Level</Label>
                                            <Input 
                                                {...register("level.jlpt")}
                                                className="bg-white/10 border-white/20 text-white" 
                                                placeholder="e.g. N5"
                                            />
                                        </div>
                                    </div>

                                    {/* Readings */}
                                    <div className="space-y-4 pt-4 border-t border-white/10">
                                        <h3 className="text-lg font-semibold text-white">Readings</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-white">Kanji</Label>
                                                 <Input 
                                                    {...register("reading.kanji")}
                                                    className="bg-white/10 border-white/20 text-white" 
                                                    placeholder="Same as Surface typically"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-white">Kana (Reading)</Label>
                                                 <Input 
                                                    {...register("reading.kana")}
                                                    className="bg-white/10 border-white/20 text-white" 
                                                    placeholder="e.g. あたらしい"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tags/POS */}
                                    <div className="space-y-4 pt-4 border-t border-white/10">
                                        <Label className="text-white">Part of Speech</Label>
                                        <div className="flex gap-2">
                                            <Input 
                                                value={posInput}
                                                onChange={(e) => setPosInput(e.target.value)}
                                                className="bg-white/10 border-white/20 text-white"
                                                placeholder="Add POS tag (e.g. Adjective)"
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPos(); }}}
                                            />
                                            <Button type="button" onClick={handleAddPos} variant="secondary">Add</Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {watch("part_of_speech")?.map((pos: string, idx: number) => (
                                                <span key={idx} className="bg-indigo-500/30 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                                    {pos}
                                                    <button type="button" onClick={() => handleRemovePos(idx)} className="hover:text-red-300">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6 flex justify-end gap-3">
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            className="text-white/70 hover:text-white"
                                            onClick={() => router.back()}
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            className="bg-primary-purple hover:bg-primary-purple/80 text-white min-w-[120px]"
                                            disabled={isSaving}
                                        >
                                            {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Word</>}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </Card>
                    </div>
                </div>
             </div>
        </AuthGuard>
    );
}
