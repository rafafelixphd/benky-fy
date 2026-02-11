"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";
import { JLPT_LEVELS, PARTS_OF_SPEECH, CONTENT_TAGS } from "@/entities/flashcards/settings";

export interface WordListFilters {
    jlpt?: string;
    custom_level?: number;
    part_of_speech?: string[];
    tags?: string[];
}

interface WordFilterProps {
    filters: WordListFilters;
    onFilterChange: (filters: WordListFilters) => void;
}

export function WordFilter({ filters, onFilterChange }: WordFilterProps) {
    const [open, setOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState<WordListFilters>(filters);

    const handleApply = () => {
        onFilterChange(localFilters);
        setOpen(false);
    };

    const handleClear = () => {
        const cleared = {
            jlpt: undefined,
            custom_level: undefined,
            part_of_speech: [],
            tags: [],
        };
        setLocalFilters(cleared);
        onFilterChange(cleared);
        setOpen(false);
    };

    const togglePos = (pos: string) => {
        const current = localFilters.part_of_speech || [];
        const next = current.includes(pos)
            ? current.filter(p => p !== pos)
            : [...current, pos];
        setLocalFilters({ ...localFilters, part_of_speech: next });
    };

    const toggleTag = (tag: string) => {
        const current = localFilters.tags || [];
        const next = current.includes(tag)
            ? current.filter(t => t !== tag)
            : [...current, tag];
        setLocalFilters({ ...localFilters, tags: next });
    };

    const activeFilterCount = [
        filters.jlpt,
        filters.custom_level,
        (filters.part_of_speech && filters.part_of_speech.length > 0),
        (filters.tags && filters.tags.length > 0)
    ].filter(Boolean).length;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 relative border-white/20 text-white hover:bg-white/10 bg-transparent">
                    <Filter className="w-4 h-4" />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-primary-purple text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-background">
                            {activeFilterCount}
                        </span>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-gray-900 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Filter Vocabulary</DialogTitle>
                    <DialogDescription className="text-white/60">
                        Narrow down the list by specific criteria.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* JLPT & Custom Level Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>JLPT Level</Label>
                            <Select
                                value={localFilters.jlpt || "all"}
                                onValueChange={(val) => setLocalFilters({ ...localFilters, jlpt: val === "all" ? undefined : val })}
                            >
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder="Any Level" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-white/10 text-white">
                                    <SelectItem value="all">Any Level</SelectItem>
                                    {JLPT_LEVELS.map(level => (
                                        <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Custom Level</Label>
                            <Input
                                type="number"
                                placeholder="e.g. 10"
                                className="bg-white/5 border-white/10 text-white"
                                value={localFilters.custom_level || ""}
                                onChange={(e) => setLocalFilters({ 
                                    ...localFilters, 
                                    custom_level: e.target.value ? parseInt(e.target.value) : undefined 
                                })}
                            />
                        </div>
                    </div>

                    {/* Part of Speech */}
                    <div className="space-y-2">
                        <Label>Part of Speech</Label>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
                            {PARTS_OF_SPEECH.map(pos => {
                                const isSelected = (localFilters.part_of_speech || []).includes(pos.value);
                                return (
                                    <div
                                        key={pos.value}
                                        onClick={() => togglePos(pos.value)}
                                        className={`
                                            cursor-pointer px-3 py-2 rounded-md text-sm border transition-colors flex items-center justify-between
                                            ${isSelected 
                                                ? "bg-primary-purple/20 border-primary-purple text-primary-purple" 
                                                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"}
                                        `}
                                    >
                                        <span>{pos.label}</span>
                                        {isSelected && <X className="w-3 h-3" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label>Content Tags</Label>
                        <div className="flex flex-wrap gap-2">
                            {CONTENT_TAGS.map(tag => {
                                const isSelected = (localFilters.tags || []).includes(tag.value);
                                return (
                                    <div
                                        key={tag.value}
                                        onClick={() => toggleTag(tag.value)}
                                        className={`
                                            cursor-pointer px-3 py-1.5 rounded-full text-xs border transition-colors
                                            ${isSelected 
                                                ? "bg-blue-500/20 border-blue-500 text-blue-400" 
                                                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"}
                                        `}
                                    >
                                        {tag.label}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex gap-2 sm:justify-between">
                    <Button variant="ghost" onClick={handleClear} className="text-white/60 hover:text-white hover:bg-white/10">
                        Clear Filters
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)} className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                            Cancel
                        </Button>
                        <Button onClick={handleApply} className="bg-primary-purple hover:bg-primary-purple/80 text-white">
                            Apply Filters
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
