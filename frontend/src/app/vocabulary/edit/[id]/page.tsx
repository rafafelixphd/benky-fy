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


import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { wordListsApiClient } from "@/api/private/word-lists/api-client";
import { WordList } from "@/entities/word-list";
import { Plus, Check } from "lucide-react";

export default function VocabularyEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const isNew = id === "new";
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [initialData, setInitialData] = useState<WordFormData | undefined>(undefined);
    
    // Add to List state
    const [lists, setLists] = useState<WordList[]>([]);
    const [selectedListId, setSelectedListId] = useState<string>("");
    const [isAddToListOpen, setIsAddToListOpen] = useState(false);
    const [isAddingToList, setIsAddingToList] = useState(false);

    const fetchLists = async () => {
        try {
            const res = await wordListsApiClient.getLists();
            if (res.success && res.data) {
                setLists(res.data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (isAddToListOpen) {
            fetchLists();
        }
    }, [isAddToListOpen]);

    const handleAddToList = async () => {
        if (!selectedListId || !id || isNew) return;

        setIsAddingToList(true);
        try {
            const listId = parseInt(selectedListId);
            const wordId = parseInt(id);
            const res = await wordListsApiClient.addWord(listId, wordId);
            
            if (res.success) {
                toast.success("Added to list!");
                setIsAddToListOpen(false);
            } else {
                 if (res.error?.includes("already exists") || res.error?.includes("UniqueConstraint")) {
                     toast.info("Word is already in this list");
                } else {
                    toast.error(res.error || "Failed to add to list");
                }
            }
        } catch (e) {
            toast.error("Error adding to list");
        } finally {
            setIsAddingToList(false);
        }
    };

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
                        <div className="flex justify-between items-center mb-4">
                            <Button 
                                variant="ghost" 
                                className="text-white/80 hover:text-white hover:bg-white/10 pl-0"
                                onClick={() => router.back()}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>

                            {!isNew && (
                                <Dialog open={isAddToListOpen} onOpenChange={setIsAddToListOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 gap-2">
                                            <Plus className="w-4 h-4" /> Add to List
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-secondary-purple border-white/10 text-white">
                                        <DialogHeader>
                                            <DialogTitle>Add to Word List</DialogTitle>
                                        </DialogHeader>
                                        <div className="py-4 space-y-4">
                                            <Label>Select List</Label>
                                            {lists.length === 0 ? (
                                                <div className="text-white/60 text-sm">No lists found. Create one first!</div>
                                            ) : (
                                                <Select value={selectedListId} onValueChange={setSelectedListId}>
                                                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                                        <SelectValue placeholder="Select a list..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-secondary-purple border-white/10 text-white">
                                                        {lists.map(list => (
                                                            <SelectItem key={list.id} value={list.id.toString()} className="focus:bg-white/10 focus:text-white">
                                                                {list.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={handleAddToList} disabled={!selectedListId || isAddingToList} className="bg-primary-purple hover:bg-primary-purple/80 text-white">
                                                {isAddingToList ? "Adding..." : "Add Word"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>

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
