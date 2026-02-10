"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/common/auth";
import { FloatingElements } from "@/components/common/layout/background";
import { NavigationHeader } from "@/components/common/layout/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { wordListsApiClient } from "@/api/private/word-lists/api-client";
import { WordList } from "@/entities/word-list";
import { Plus, Trash2, ChevronRight, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils/utils";

export default function WordListsPage() {
    const router = useRouter();
    const [lists, setLists] = useState<WordList[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newListName, setNewListName] = useState("");
    const [newListDesc, setNewListDesc] = useState("");

    const fetchLists = async () => {
        setLoading(true);
        try {
            const res = await wordListsApiClient.getLists();
            if (res.success && res.data) {
                setLists(res.data);
            } else {
                toast.error(res.error || "Failed to load lists");
            }
        } catch (e) {
            toast.error("An error occurred while fetching lists");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLists();
    }, []);

    const handleCreateList = async () => {
        if (!newListName.trim()) return;

        try {
            const res = await wordListsApiClient.createList({
                name: newListName,
                description: newListDesc,
            });

            if (res.success) {
                toast.success("List created successfully");
                setIsCreateOpen(false);
                setNewListName("");
                setNewListDesc("");
                fetchLists(); // Refresh list
            } else {
                toast.error(res.error || "Failed to create list");
            }
        } catch (e) {
            toast.error("An error occurred while creating the list");
        }
    };

    const handleDeleteList = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        if (!confirm("Are you sure you want to delete this list?")) return;

        try {
            const res = await wordListsApiClient.deleteList(id);
            if (res.success) {
                toast.success("List deleted");
                setLists(prev => prev.filter(l => l.id !== id));
            } else {
                toast.error(res.error || "Failed to delete list");
            }
        } catch (e) {
             toast.error("An error occurred while deleting the list");
        }
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-gradient-to-br from-primary-purple to-secondary-purple relative overflow-hidden flex flex-col">
                <FloatingElements />
                <NavigationHeader />

                <div className="relative z-10 pt-24 px-6 pb-6 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">My Word Lists</h1>
                    <p className="text-white/80">Organize your vocabulary into custom lists</p>
                </div>

                <div className="relative z-10 px-6 pb-6 flex-1 overflow-auto w-full max-w-6xl mx-auto">
                    <div className="flex justify-end mb-6">
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-white text-primary-purple hover:bg-white/90 font-semibold gap-2">
                                    <Plus className="w-4 h-4" /> Create New List
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-secondary-purple border-white/10 text-white">
                                <DialogHeader>
                                    <DialogTitle>Create New Word List</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">List Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="e.g. JLPT N5 Verbs"
                                            value={newListName}
                                            onChange={(e) => setNewListName(e.target.value)}
                                            className="bg-white/10 border-white/20 text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="desc">Description (Optional)</Label>
                                        <Input
                                            id="desc"
                                            placeholder="Brief description..."
                                            value={newListDesc}
                                            onChange={(e) => setNewListDesc(e.target.value)}
                                            className="bg-white/10 border-white/20 text-white"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="border-white/20 hover:bg-white/10 text-white hover:text-white">Cancel</Button>
                                    <Button 
                                    onClick={handleCreateList} 
                                    >Create List</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {loading ? (
                        <div className="text-center text-white/50 mt-10">Loading lists...</div>
                    ) : lists.length === 0 ? (
                        <div className="text-center text-white/50 mt-10 bg-white/5 rounded-lg p-10 border border-white/10">
                            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-medium mb-2">No lists yet</h3>
                            <p className="mb-6">Create your first custom word list to start organizing your vocabulary.</p>
                            <Button onClick={() => setIsCreateOpen(true)} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                Create List
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {lists.map((list) => (
                                <Card 
                                    key={list.id}
                                    className="bg-white/10 backdrop-blur-md border-white/10 overflow-hidden hover:bg-white/15 transition-colors cursor-pointer group flex flex-col"
                                    onClick={() => router.push(`/vocabulary/lists/${list.id}`)}
                                    interactive={true}
                                >
                                    <div className="p-6 flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-primary-purple/30 rounded-lg">
                                                <BookOpen className="w-6 h-6 text-white" />
                                            </div>
                                            <Button
                                                variant="ghost" 
                                                size="icon" 
                                                className="text-white/40 hover:text-red-400 hover:bg-red-400/10 -mt-2 -mr-2"
                                                onClick={(e) => handleDeleteList(list.id, e)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">{list.name}</h3>
                                        <p className="text-white/60 text-sm line-clamp-2 min-h-[40px]">
                                            {list.description || "No description provided."}
                                        </p>
                                    </div>
                                    <div className="px-6 py-4 bg-black/20 border-t border-white/5 flex justify-between items-center text-white/60 text-sm">
                                        <span>{list.entry_count ?? 0} words</span>
                                        <div className="flex items-center group-hover:translate-x-1 transition-transform text-primary-purple font-medium">
                                            View List <ChevronRight className="w-4 h-4 ml-1" />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}
