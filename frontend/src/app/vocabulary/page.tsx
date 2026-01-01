"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/common/auth";
import { FloatingElements } from "@/components/common/layout/background";
import { ProductsHeader } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { wordsApiClient } from "@/api/private/words/api-client";
import { Word } from "@/entities/word";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; 
import { Search, Plus, ChevronLeft, ChevronRight, Edit } from "lucide-react"; 
// Actually, let's implement inline debounce or use timer for simplicity if hook doesn't exist.
// Let's check hooks folder first? No, let's just use simple setTimeout.

const ITEMS_PER_PAGE = 20;

export default function VocabularyPage() {
    const router = useRouter();
    const [words, setWords] = useState<Word[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Simple debounce effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1); // Reset to page 1 on new search
            fetchWords(searchQuery);
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Page change effect needs to respect current search
    useEffect(() => {
        fetchWords(searchQuery);
    }, [page]);

    // We don't have total count API yet, so we'll just check if we got full page
    const [hasMore, setHasMore] = useState(true); 

    const fetchWords = async (q: string) => {
        setLoading(true);
        try {
            const startId = (page - 1) * ITEMS_PER_PAGE + 1;
            const endId = page * ITEMS_PER_PAGE;
            
            // If searching, we might want different pagination logic or just rely on backend filtering within ID range?
            // User requirement: "20 words at time" + "API calls to retrieve another 20 words".
            // Backend handles q + range.
            
            // Note: Pagination by ID range with search is tricky because IDs are sparse in search results.
            // E.g. IDs 1, 5, 100 match "cat".
            // If we request 1-20, we get 1, 5.
            // If we request 21-40, we get nothing.
            // It might feel like "empty pages" if we strict ID range.
            // BUT, our backend implementation applies ID filter AND search filter.
            // Ideally partial content search should depend on LIMIT/OFFSET, not ID range.
            // However, we implemented ID range. Let's stick to it for now as per "multi-pagination via ID" plan, 
            // but acknowledge limitation or switch strategy if user complains.
            // Actually, for search, ID range is bad. 
            // Let's pass startId/endId ONLY if q is empty? 
            // Or maybe our backend should just return first 20 matches? 
            // Our backend *does* apply limit(100).
            // Let's pass null start/end if searching? 
            // The `api-client` allows optional.
            
            // Wait, the plan said: "Match q ... Apply pagination to filtered results".
            // If I pass start_id/end_id AND q, I am searching "within IDs 1-20".
            // This is probably NOT what users expect (they want to search ALL words).
            // Better behavior: If `q` is present, ignore `start_id`/`end_id` for "pages" and maybe use simple limit?
            // Or we just show all results (capped at 100 by backend)?
            // Let's try passing q and see. If page 1, we probably want start=1, end=infinity?
            // For now, let's keep it simple: Search searches EVERYTHING (no range params) or large range?
            // Let's just pass `q` and OMIT start/end if we want distinct results, or use very large range.
            // But if we want pagination on search results, we strictly need OFFSET/LIMIT backend support which we didn't add.
            // We added ID range.
            // So, for now, let's just don't pass IDs when searching, so we get first 100 matches.
            
            let res;
            if (q) {
                res = await wordsApiClient.getWordsList(undefined, undefined, q);
            } else {
                 res = await wordsApiClient.getWordsList(startId, endId);
            }
            
            if (res.success && res.data) {
                setWords(res.data);
                setHasMore(res.data.length > 0 && !q); // Disable next button on search for now as we don't paginate search
            } else {
                setWords([]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        setPage(p => p + 1);
    };

    const handlePrev = () => {
        if (page > 1) setPage(p => p - 1);
    };

    return (
        <AuthGuard>
             <div className="min-h-screen bg-gradient-to-br from-primary-purple to-secondary-purple relative overflow-hidden flex flex-col">
                <FloatingElements />
                <ProductsHeader 
                    title="Vocabulary List" 
                    subtitle="Manage your word collection"
                />

                <div className="relative z-10 px-6 pb-6 flex-1 overflow-auto">
                    <div className="max-w-6xl mx-auto mt-6">
                        <div className="flex justify-between items-center mb-4 gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                                <Input 
                                    className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                                    placeholder="Search vocabulary (matches live)..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button 
                                onClick={() => router.push("/vocabulary/edit/new")}
                                className="bg-primary-purple hover:bg-primary-purple/80 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add Word
                            </Button>
                        </div>

                        <Card className="bg-background/20 backdrop-blur-md border-white/20 overflow-hidden">
                            <div className="p-0">
                                <div className="grid grid-cols-[80px_1fr_1fr_1fr_100px] gap-4 p-4 border-b border-white/10 text-white/70 font-medium text-sm">
                                    <div>ID</div>
                                    <div>Surface</div>
                                    <div>Reading</div>
                                    <div>Meaning</div>
                                    <div className="text-right">Actions</div>
                                </div>
                                
                                {loading ? (
                                    <div className="p-8 text-center text-white/50">Loading...</div>
                                ) : words.length === 0 ? (
                                    <div className="p-8 text-center text-white/50">No words found in this range.</div>
                                ) : (
                                    words.map((word) => (
                                        <div 
                                            key={word.id} 
                                            className="grid grid-cols-[80px_1fr_1fr_1fr_100px] gap-4 p-4 border-b last:border-0 border-white/10 text-white items-center hover:bg-white/5 transition-colors"
                                        >
                                            <div className="text-white/50">#{word.id}</div>
                                            <div className="font-bold text-lg">{word.surface}</div>
                                            <div>{word.reading?.kana}</div>
                                            <div className="truncate text-white/80">
                                                {word.reading?.english?.join(", ")}
                                            </div>
                                            <div className="text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    onClick={() => router.push(`/vocabulary/edit/${word.id}`)}
                                                    className="hover:bg-white/10 text-white/70 hover:text-white"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            {/* Pagination */}
                            <div className="p-4 border-t border-white/10 flex justify-between items-center text-white/70">
                                <div>
                                    Page {page} <span className="text-white/30 text-xs ml-2">(IDs {(page - 1) * ITEMS_PER_PAGE + 1} - {page * ITEMS_PER_PAGE})</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={handlePrev} 
                                        disabled={page === 1 || loading}
                                        className="text-white hover:bg-white/10 disabled:opacity-50"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={handleNext} 
                                        disabled={!hasMore || loading}
                                        className="text-white hover:bg-white/10 disabled:opacity-50"
                                    >
                                        Next <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
             </div>
        </AuthGuard>
    );
}
