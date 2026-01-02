"use client";

import { useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/common/auth";
import { NavigationHeader } from "@/components/common/layout/navigation/navigation-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function CreateWordPage() {
  const searchParams = useSearchParams();
  const surface = searchParams.get("surface") || "";
  const lemma = searchParams.get("lemma") || "";

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
        <NavigationHeader />
        
        <div className="pt-24 px-6 max-w-2xl mx-auto">
          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-6">Add New Word</h1>
            
            <form className="space-y-4">
              <div className="space-y-2">
                <Label>Surface Form (Kanji)</Label>
                <Input defaultValue={surface} placeholder="e.g. 食べる" />
              </div>
              
              <div className="space-y-2">
                <Label>Reading (Kana)</Label>
                <Input defaultValue={lemma} placeholder="e.g. たべる" />
              </div>

               <div className="space-y-2">
                <Label>English Meaning</Label>
                <Input placeholder="e.g. to eat" />
              </div>

               <div className="space-y-2">
                <Label>Part of Speech</Label>
                <Input placeholder="e.g. Verb" />
              </div>

              <div className="pt-4 flex gap-4">
                  <Button type="submit" className="w-full">Create Word</Button>
                  <Button variant="outline" className="w-full" type="button" onClick={() => window.history.back()}>Cancel</Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
