import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { wordListsApiClient } from "@/api/private/word-lists/api-client";
import { WordList } from "@/entities/word-list";
import { BookOpen, Check, FolderPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/utils";

interface AddToListDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    wordIds: number[];
    onSuccess?: () => void;
}

export function AddToListDialog({
    open,
    onOpenChange,
    wordIds,
    onSuccess,
}: AddToListDialogProps) {
    const [lists, setLists] = useState<WordList[]>([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);
    const [selectedListId, setSelectedListId] = useState<number | null>(null);

    useEffect(() => {
        if (open) {
            fetchLists();
            setSelectedListId(null);
        }
    }, [open]);

    const fetchLists = async () => {
        setLoading(true);
        try {
            const res = await wordListsApiClient.getLists();
            if (res.success && res.data) {
                setLists(res.data);
            } else {
                toast.error("Failed to load lists");
            }
        } catch (e) {
            toast.error("Error loading lists");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!selectedListId || wordIds.length === 0) return;

        setAdding(true);
        let successCount = 0;
        let failCount = 0;

        try {
            // Sequential additions for now as backend might not support bulk
            // TODO: Implement bulk endpoint in future
            for (const wordId of wordIds) {
                try {
                    const res = await wordListsApiClient.addWord(selectedListId, wordId);
                    if (res.success) {
                        successCount++;
                    } else {
                        failCount++;
                    }
                } catch (e) {
                    failCount++;
                }
            }

            if (successCount > 0) {
                toast.success(`Added ${successCount} word${successCount !== 1 ? 's' : ''} to list`);
                onOpenChange(false);
                if (onSuccess) onSuccess();
            }

            if (failCount > 0) {
                toast.error(`Failed to add ${failCount} word${failCount !== 1 ? 's' : ''}`);
            }

        } catch (e) {
            toast.error("Unexpected error adding to list");
        } finally {
            setAdding(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-secondary-purple border-white/10 text-white max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FolderPlus className="w-5 h-5" />
                        Add {wordIds.length} word{wordIds.length !== 1 ? 's' : ''} to List
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4 -mr-2 pr-2">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-white/50" />
                        </div>
                    ) : lists.length === 0 ? (
                        <div className="text-center py-8 text-white/60">
                            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No lists found.</p>
                            <p className="text-sm mt-1">Create a list first to add words.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {lists.map((list) => (
                                <div
                                    key={list.id}
                                    onClick={() => setSelectedListId(list.id)}
                                    className={cn(
                                        "flex items-center p-3 rounded-lg border cursor-pointer transition-all",
                                        selectedListId === list.id
                                            ? "bg-primary-purple/20 border-primary-purple ring-1 ring-primary-purple"
                                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                    )}
                                >
                                    <div className={cn(
                                        "w-4 h-4 rounded-full border flex items-center justify-center mr-3 flex-shrink-0",
                                        selectedListId === list.id
                                            ? "bg-primary-purple border-primary-purple"
                                            : "border-white/30"
                                    )}>
                                        {selectedListId === list.id && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium truncate">{list.name}</h4>
                                        {list.description && (
                                            <p className="text-xs text-white/50 truncate">{list.description}</p>
                                        )}
                                    </div>
                                    <div className="text-xs text-white/40 ml-2">
                                        {list.entry_count ?? 0} words
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter className="sm:justify-between gap-2 border-t border-white/10 pt-4 mt-auto">
                     <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="text-white/60 hover:text-white hover:bg-white/10"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAdd}
                        disabled={!selectedListId || adding || lists.length === 0}
                        className="bg-primary-purple hover:bg-primary-purple/90 min-w-[100px]"
                    >
                        {adding ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <FolderPlus className="w-4 h-4 mr-2" />
                        )}
                        {adding ? "Adding..." : "Add to List"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
