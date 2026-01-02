"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { AuthGuard } from "@/components/common/auth";
import { FloatingElements } from "@/components/common/layout/background";
import { NavigationHeader } from "@/components/common/layout/navigation/navigation-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { wordsApiClient } from "@/api/private/words/api-client";
import { Word } from "@/entities/word";
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";

// Helper interface for the form
interface Segment {
    kanji: string;
    kana: string;
    type: string;
}

interface WordFormData {
  surface: string;
  level: {
    jlpt: string;
    custom?: number;
  };
  reading: {
    kanji: string;
    kana: string;
    english: { value: string }[]; // Object array for useFieldArray
    romaji: string[];
  };
  segments: Segment[]; // For handling splits
  part_of_speech: string[];
  category: string[];
}

export default function VocabularyEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const isNew = id === "new";
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [posInput, setPosInput] = useState("");

    const { register, control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<WordFormData>({
        defaultValues: {
            surface: "",
            level: { jlpt: "N5" },
            reading: { kanji: "", kana: "", english: [], romaji: [] },
            segments: [],
            part_of_speech: [],
            category: []
        }
    });


    // Field Array for English meanings
    const { 
        fields: englishFields, 
        append: appendEnglish, 
        remove: removeEnglish 
    } = useFieldArray({
        control,
        name: "reading.english"
    });

    // Field Array for Segments (Splits)
    const { 
        fields: segmentFields, 
        append: appendSegment, 
        remove: removeSegment,
        move: moveSegment
    } = useFieldArray({
        control,
        name: "segments"
    });

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

                reset({
                    surface: w.surface,
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

    const handleAddPos = () => {
        if (!posInput.trim()) return;
        const current = watch("part_of_speech") || [];
        if (!current.includes(posInput.trim())) {
            setValue("part_of_speech", [...current, posInput.trim()]);
        }
        setPosInput("");
    };

    const handleRemovePos = (index: number) => {
        const current = watch("part_of_speech") || [];
        setValue("part_of_speech", current.filter((_, i) => i !== index));
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
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                    {/* --- Identity --- */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Basic Info</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-white">Surface Form (Kanji/Main)</Label>
                                                <Input 
                                                    {...register("surface", { required: true })}
                                                    className="bg-white/10 border-white/20 text-white" 
                                                    placeholder="e.g. 電気"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-white">JLPT Level</Label>
                                                    <Input 
                                                        {...register("level.jlpt")}
                                                        className="bg-white/10 border-white/20 text-white" 
                                                        placeholder="e.g. N5"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-white">Custom Level</Label>
                                                    <Input 
                                                        type="number"
                                                        {...register("level.custom")}
                                                        className="bg-white/10 border-white/20 text-white" 
                                                        placeholder="e.g. 1"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- Readings --- */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Readings</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-white">Full Kanji</Label>
                                                 <Input 
                                                    {...register("reading.kanji")}
                                                    className="bg-white/10 border-white/20 text-white" 
                                                    placeholder="Normally matches Surface"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-white">Full Kana</Label>
                                                 <Input 
                                                    {...register("reading.kana")}
                                                    className="bg-white/10 border-white/20 text-white" 
                                                    placeholder="e.g. でんき"
                                                />
                                            </div>
                                        </div>

                                        {/* English Meanings Array */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-white">English Meanings</Label>
                                                <Button 
                                                    type="button" 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-8 text-white/70 hover:text-white"
                                                    onClick={() => appendEnglish({ value: "" })}
                                                >
                                                    <Plus className="w-3 h-3 mr-1" /> Add
                                                </Button>
                                            </div>
                                            {englishFields.map((field, index) => (
                                                <div key={field.id} className="flex gap-2">
                                                    <Input
                                                        {...register(`reading.english.${index}.value` as const)}
                                                        className="bg-white/10 border-white/20 text-white"
                                                        placeholder="Meaning..."
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="shrink-0 text-white/50 hover:text-red-400 hover:bg-white/5"
                                                        onClick={() => removeEnglish(index)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {englishFields.length === 0 && (
                                                <p className="text-xs text-white/30 italic">No definitions added.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* --- Segmentation --- */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                            <h3 className="text-lg font-semibold text-white">Segmentation</h3>
                                            <Button 
                                                type="button" 
                                                variant="secondary" 
                                                size="sm" 
                                                onClick={() => appendSegment({ kanji: "", kana: "", type: "kanji" })}
                                            >
                                                <Plus className="w-3 h-3 mr-1" /> Add Segment
                                            </Button>
                                        </div>
                                        <p className="text-xs text-white/50">
                                            Break down the word into parts for detailed rendering (Kanji + Furigana). The sequence must reconstruct the full word.
                                        </p>
                                        
                                        <div className="space-y-2">
                                            {segmentFields.length > 0 && (
                                                <div className="grid grid-cols-[1fr,1fr,100px,40px] gap-2 px-2 text-xs text-white/50 font-medium uppercase">
                                                    <div>Part (Kanji)</div>
                                                    <div>Reading (Kana)</div>
                                                    <div>Type</div>
                                                    <div></div>
                                                </div>
                                            )}
                                            
                                            {segmentFields.map((field, index) => (
                                                <div key={field.id} className="grid grid-cols-[1fr,1fr,100px,40px] gap-2 items-start">
                                                    <Input
                                                        {...register(`segments.${index}.kanji` as const)}
                                                        className="bg-white/10 border-white/20 text-white"
                                                        placeholder="Part"
                                                    />
                                                    <Input
                                                        {...register(`segments.${index}.kana` as const)}
                                                        className="bg-white/10 border-white/20 text-white"
                                                        placeholder="Reading"
                                                    />
                                                    <select
                                                        {...register(`segments.${index}.type` as const)}
                                                        className="h-10 w-full rounded-md border border-white/20 bg-white/10 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    >
                                                        <option value="kanji">Kanji</option>
                                                        <option value="hiragana">Hiragana</option>
                                                        <option value="katakana">Katakana</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-white/50 hover:text-red-400 hover:bg-white/5"
                                                        onClick={() => removeSegment(index)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {segmentFields.length === 0 && (
                                                <div className="p-4 border border-dashed border-white/10 rounded-md text-center">
                                                    <p className="text-sm text-white/40">No segments defined.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* --- Tags --- */}
                                    <div className="space-y-4 pt-4 border-t border-white/10">
                                        <Label className="text-white">Part of Speech</Label>
                                        <div className="flex gap-2">
                                            <Input 
                                                value={posInput}
                                                onChange={(e) => setPosInput(e.target.value)}
                                                className="bg-white/10 border-white/20 text-white max-w-xs"
                                                placeholder="Add POS tag"
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

                                    <div className="pt-6 flex justify-end gap-3 border-t border-white/10">
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
