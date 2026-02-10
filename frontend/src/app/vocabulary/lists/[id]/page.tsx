"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/common/auth";
import { FloatingElements } from "@/components/common/layout/background";
import { NavigationHeader } from "@/components/common/layout/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { wordListsApiClient } from "@/api/private/word-lists/api-client";
import { wordsApiClient } from "@/api/private/words/api-client";
import { WordList, WordListEntry } from "@/entities/word-list";
import { Word } from "@/entities/word";
import { Search, Plus, Trash2, ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/utils";

// Debounce helper
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export default function WordListDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const listId = Number(params.id);

    const [list, setList] = useState<WordList | null>(null);
    const [loading, setLoading] = useState(true);
    const [listWords, setListWords] = useState<Word[]>([]);
    
    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 300);
    const [searchResults, setSearchResults] = useState<Word[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const fetchListDetails = useCallback(async () => {
        setLoading(true);
        try {
            const res = await wordListsApiClient.getList(listId);
            if (res.success && res.data) {
                setList(res.data);
                if (res.data.words) {
                    setListWords(res.data.words);
                }
            } else {
                toast.error(res.error || "Failed to load list details");
                router.push("/vocabulary/lists");
            }
        } catch (e) {
             toast.error("Error loading list");
        } finally {
            setLoading(false);
        }
    }, [listId, router]);

    useEffect(() => {
        if (!isNaN(listId)) {
            fetchListDetails();
        }
    }, [listId, fetchListDetails]);

    // Handle Search
    useEffect(() => {
        if (!debouncedSearch.trim()) {
            setSearchResults([]);
            return;
        }

        const doSearch = async () => {
            setIsSearching(true);
            try {
                // Determine if we are searching by ID or text? API supports 'q'.
                const res = await wordsApiClient.getWordsList(undefined, undefined, debouncedSearch);
                if (res.success && res.data) {
                    // Filter out already added words? Optional visualization.
                    setSearchResults(res.data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsSearching(false);
            }
        };

        doSearch();
    }, [debouncedSearch]);


    const handleAddWord = async (word: Word) => {
        try {
            const res = await wordListsApiClient.addWord(listId, word.id);
            if (res.success) {
                toast.success(`Added "${word.surface}" to list`);
                setListWords((prev) => [...prev, word]);
            } else {
                toast.error(res.error || "Failed to add word");
            }
        } catch (e) {
            toast.error("Error adding word");
        }
    };

    const handleRemoveWord = async (wordId: number) => {
        if (!confirm("Remove this word from the list?")) return;

        try {
            const res = await wordListsApiClient.removeWord(listId, wordId);
            if (res.success) {
                toast.success("Word removed");
                setListWords((prev) => prev.filter((w) => w.id !== wordId));
            } else {
                toast.error(res.error || "Failed to remove word");
            }
        } catch (e) {
            toast.error("Error removing word");
        }
    };

    if (loading && !list) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (!list) return null;

    return (
        <AuthGuard>
            <div className="min-h-screen bg-gradient-to-br from-primary-purple to-secondary-purple relative overflow-hidden flex flex-col">
                <FloatingElements />
                <NavigationHeader />

                <div className="relative z-10 pt-24 px-6 pb-6 text-center max-w-4xl mx-auto w-full">
                    <div className="flex items-center justify-between mb-6">
                        <Button 
                            variant="ghost" 
                            className="text-white/60 hover:text-white hover:bg-white/10"
                            onClick={() => router.push("/vocabulary/lists")}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Lists
                        </Button>
                        <div className="flex-1 text-center pr-20">
                             <h1 className="text-3xl font-bold text-white mb-2">{list.name}</h1>
                             <p className="text-white/80">{list.description}</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 px-6 pb-6 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Main Content: List Words */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-white/10 backdrop-blur-md border-white/10 p-6 min-h-[500px]">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                                <span className="mr-2">📚</span> List Contents ({listWords.length})
                            </h2>
                            
                            {listWords.length === 0 ? (
                                <div className="text-center py-20 text-white/40">
                                    <p>This list is empty.</p>
                                    <p className="text-sm mt-2">Search for words on the right to add them!</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {listWords.map(word => (
                                        <div key={word.id} className="flex justify-between items-center bg-white/5 hover:bg-white/10 p-3 rounded-lg border border-white/5 transition-colors group">
                                            <div>
                                                <div className="font-bold text-lg text-white flex items-baseline gap-2">
                                                    {word.surface}
                                                    <span className="text-sm font-normal text-white/60">({word.reading?.kana || "N/A"})</span>
                                                </div>
                                                <div className="text-sm text-white/60">
                                                    {word.reading?.english?.join(", ")}
                                                </div>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="icon"
                                                className="text-white/20 group-hover:text-red-400 hover:bg-red-400/10"
                                                onClick={() => handleRemoveWord(word.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Sidebar: Search & Add */}
                    <div className="lg:col-span-1">
                        <Card className="bg-secondary-purple/80 backdrop-blur-md border-white/10 p-6 sticky top-24">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                <Search className="w-5 h-5 mr-2" /> Add Words
                            </h3>
                            <div className="relative mb-4">
                                <Input 
                                    className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                                    placeholder="Search dictionary..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {isSearching && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 className="w-4 h-4 animate-spin text-white/50" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 max-h-[60vh] overflow-auto pr-1 scrollbar-thin scrollbar-thumb-white/20">
                                {searchQuery && searchResults.length === 0 && !isSearching && (
                                    <div className="text-center text-white/40 py-4">No results found</div>
                                )}
                                
                                {searchResults.map(word => {
                                    const isAlreadyAdded = listWords.some(w => w.id === word.id);
                                    return (
                                        <div key={word.id} className={cn(
                                            "p-3 rounded-lg border border-white/5 flex justify-between items-center transition-all",
                                            isAlreadyAdded ? "bg-primary-purple/20 border-primary-purple/30 opacity-50" : "bg-white/5 hover:bg-white/10"
                                        )}>
                                            <div className="overflow-hidden mr-2">
                                                <div className="font-bold text-white truncate">{word.surface}</div>
                                                <div className="text-xs text-white/60 truncate">{word.reading?.english?.[0] || ""}</div>
                                            </div>
                                            {!isAlreadyAdded ? (
                                                <Button 
                                                    size="sm" 
                                                    className="h-8 w-8 p-0 bg-white/10 hover:bg-primary-purple text-white rounded-full"
                                                    onClick={() => handleAddWord(word)}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-primary-purple font-medium">Added</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    </div>

                </div>
            </div>
        </AuthGuard>
    );
}
