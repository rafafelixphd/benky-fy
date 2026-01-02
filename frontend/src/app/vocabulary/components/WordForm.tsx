"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save } from "lucide-react";

export interface Segment {
    kanji: string;
    kana: string;
    type: string;
}

export interface WordFormData {
  surface: string;
  level: {
    jlpt: string;
    custom?: number;
  };
  reading: {
    kanji: string;
    kana: string;
    english: { value: string }[];
    romaji: string[];
  };
  segments: Segment[];
  part_of_speech: string[];
  category: string[];
}

interface WordFormProps {
    initialData?: WordFormData;
    onSubmit: (data: WordFormData) => Promise<void>;
    isSaving: boolean;
    onCancel: () => void;
}

export function WordForm({ initialData, onSubmit, isSaving, onCancel }: WordFormProps) {
    const defaultValues: WordFormData = initialData || {
        surface: "",
        level: { jlpt: "N5" },
        reading: { kanji: "", kana: "", english: [], romaji: [] },
        segments: [],
        part_of_speech: [],
        category: []
    };

    const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<WordFormData>({
        defaultValues,
        values: initialData 
    });

    const { 
        fields: englishFields, 
        append: appendEnglish, 
        remove: removeEnglish 
    } = useFieldArray({
        control,
        name: "reading.english"
    });

    const { 
        fields: segmentFields, 
        append: appendSegment, 
        remove: removeSegment,
    } = useFieldArray({
        control,
        name: "segments"
    });

    // Helper for POS tags
    const handleAddPos = (posInput: string) => {
        if (!posInput.trim()) return;
        const current = watch("part_of_speech") || [];
        if (!current.includes(posInput.trim())) {
            setValue("part_of_speech", [...current, posInput.trim()]);
        }
    };

    const handleRemovePos = (index: number) => {
        const current = watch("part_of_speech") || [];
        setValue("part_of_speech", current.filter((_, i) => i !== index));
    };

    const [posInputState, setPosInputState] = require("react").useState("");


    return (
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
                        value={posInputState}
                        onChange={(e) => setPosInputState(e.target.value)}
                        className="bg-white/10 border-white/20 text-white max-w-xs"
                        placeholder="Add POS tag"
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPos(posInputState); setPosInputState(""); }}}
                    />
                    <Button type="button" onClick={() => { handleAddPos(posInputState); setPosInputState(""); }} variant="secondary">Add</Button>
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
                    onClick={onCancel}
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
    );    
}
