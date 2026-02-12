"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchFromBackend } from "@/lib/utils/api-utils";
import { Loader2, Plus } from "lucide-react";

type WordList = {
  id: number;
  name: string;
  description: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wordId: number;
  wordSurface: string;
};

export function SaveToListDialog({ open, onOpenChange, wordId, wordSurface }: Props) {
  const [lists, setLists] = useState<WordList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      loadLists();
    }
  }, [open]);

  const loadLists = async () => {
    setIsLoading(true);
    try {
      const data = await fetchFromBackend("/v2/word-lists");
      setLists(data.lists || []);
      if (data.lists && data.lists.length > 0) {
        setSelectedListId(data.lists[0].id.toString());
      }
    } catch (error) {
      console.error("Failed to load lists:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let listId = selectedListId;

      // Create new list if needed
      if (isCreatingNew) {
        const newList = await fetchFromBackend("/v2/word-lists", {
          method: "POST",
          body: JSON.stringify({
            name: newListName,
            description: newListDescription,
          }),
        });
        listId = newList.id.toString();
      }

      // Add word to list
      await fetchFromBackend(`/v2/word-lists/${listId}/entries`, {
        method: "POST",
        body: JSON.stringify({
          word_id: wordId,
        }),
      });

      onOpenChange(false);
      // Reset state
      setIsCreatingNew(false);
      setNewListName("");
      setNewListDescription("");
    } catch (error) {
      console.error("Failed to save word to list:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save "{wordSurface}" to List</DialogTitle>
          <DialogDescription>
            Choose an existing list or create a new one to save this word.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {!isCreatingNew ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="list-select">Select List</Label>
                  <select
                    id="list-select"
                    value={selectedListId}
                    onChange={(e) => setSelectedListId(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                  >
                    {lists.map((list) => (
                      <option key={list.id} value={list.id.toString()}>
                        {list.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => setIsCreatingNew(true)}
                >
                  <Plus className="w-4 h-4" />
                  Create New List
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="new-list-name">List Name</Label>
                  <Input
                    id="new-list-name"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="e.g., JLPT N3 Vocabulary"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="new-list-description">Description (optional)</Label>
                  <Input
                    id="new-list-description"
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    placeholder="e.g., Words for JLPT N3 exam"
                    className="mt-1"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setIsCreatingNew(false)}
                >
                  Back to List Selection
                </Button>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || (isCreatingNew && !newListName.trim()) || (!isCreatingNew && !selectedListId)}
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save to List
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
