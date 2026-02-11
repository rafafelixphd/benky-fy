"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/common/auth";
import { FloatingElements } from "@/components/common/layout/background";
import { NavigationHeader } from "@/components/common/layout/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { wordsApiClient } from "@/api/private/words/api-client";
import { Word } from "@/entities/word";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; 
import { Search, Plus, ChevronLeft, ChevronRight, Edit } from "lucide-react"; 
import { WordFilter, WordListFilters } from "./_components/word-filter"; 
// Actually, let's implement inline debounce or use timer for simplicity if hook doesn't exist.
// Let's check hooks folder first? No, let's just use simple setTimeout.

const ITEMS_PER_PAGE = 20;

export default function VocabularyPage() {
    const router = useRouter();
    const [words, setWords] = useState<Word[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<WordListFilters>({});
    
    // Simple debounce effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1); // Reset to page 1 on new search
            fetchWords(searchQuery, filters);
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [searchQuery, filters]);

    // Page change effect needs to respect current search
    useEffect(() => {
        fetchWords(searchQuery, filters);
    }, [page]);

    // We don't have total count API yet, so we'll just check if we got full page
    const [hasMore, setHasMore] = useState(true); 

    const fetchWords = async (q: string, currentFilters: WordListFilters) => {
        setLoading(true);
        try {
            const startId = (page - 1) * ITEMS_PER_PAGE + 1;
            const endId = page * ITEMS_PER_PAGE;
            let res;
            if (q || Object.keys(currentFilters).length > 0) {
                res = await wordsApiClient.getWordsList(undefined, undefined, q, currentFilters);
            } else {
                 res = await wordsApiClient.getWordsList(startId, endId);
            }
            
            if (res.success && res.data) {
                setWords(res.data);
                setHasMore(res.data.length > 0 && !q && Object.keys(currentFilters).length === 0); // Disable next button on search/filter for now
            } else {
                setWords([]);
            }
        } catch (e) {
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
      <div className="min-h-screen bg-gradient-to-br from-primary-purple to-secondary-purple relative overflow-hidden">
        <FloatingElements />

        <NavigationHeader />

        <div className="relative z-10 pt-24 px-6 pb-6 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Vocabulary</h1>
            <p className="text-white/80">Change and edit words</p>
        </div>

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
                    <WordFilter filters={filters} onFilterChange={setFilters} />
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
                                <div key={word.id} className="grid grid-cols-[80px_1fr_1fr_1fr_100px] gap-4 p-4 border-b border-white/10 text-white/70">
                                    <div>{word.id}</div>
                                    <div>{word.surface}</div>
                                    <div>{word.reading.kana}</div>
                                    <div>{word.reading.english?.join(", ")}</div>
                                    <div className="text-right">
                                        <Button 
                                            onClick={() => router.push(`/vocabulary/edit/${word.id}`)}
                                            variant="outline"
                                            size="icon"
                                            className="border-white/20 text-white hover:bg-white/10"

                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                <div className="flex justify-between items-center mt-4">
                    <Button 
                        onClick={handlePrev}
                        disabled={page === 1}
                        className="bg-primary-purple hover:bg-primary-purple/80 text-white"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                    </Button>
                    <Button 
                        onClick={handleNext}
                        disabled={!hasMore}
                        className="bg-primary-purple hover:bg-primary-purple/80 text-white"
                    >
                        Next <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </div>


      </div>
    </AuthGuard>
  );
}
