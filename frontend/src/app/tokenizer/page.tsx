"use client";

import { AuthGuard } from "@/components/common/auth";
import { FloatingElements } from "@/components/common/layout/background";
import { NavigationHeader } from "@/components/common/layout/navigation/navigation-header";
import { Card } from "@/components/ui/card";
import { useTokenizer } from "@/lib/tokenizer/useTokenizer";
import { TokenizerEditor } from "./components/TokenizerEditor";
import { TokenizerLegend } from "./components/TokenizerLegend";
import { TokenizerUniqueWords } from "./components/TokenizerUniqueWords";

export default function TokenizerPage() {
  const { text, setText, tokens, lexemes, isLoading } = useTokenizer();

  const handleReplaceAll = (target: string, word: import("@/entities/word").Word) => {
      // Global replace for MVP. 
      const newText = text.replaceAll(target, word.reading.kanji);
      setText(newText);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-primary-purple to-secondary-purple relative overflow-hidden">
        <FloatingElements />

        <NavigationHeader />

        <div className="relative z-10 pt-24 px-6 pb-6 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Japanese Tokenizer</h1>
            <p className="text-white/80">Real-time morphological analysis and visualization</p>
        </div>

        {/* Main Content */}
        <div className="relative z-10 px-6 pb-6 h-[calc(100vh-200px)]">
          <div className="max-w-7xl mx-auto h-full grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left Col: Editor */}
            <div className="lg:col-span-3 flex flex-col h-full">
                <Card className="bg-background/95 backdrop-blur-sm border-white/20 p-6 shadow-xl flex-1 flex flex-col">
                    <div className="mb-4">
                    <TokenizerLegend />
                    </div>
                    
                    <div className="flex-1 min-h-0"> 
                        <TokenizerEditor 
                            text={text} 
                            setText={setText} 
                            tokens={tokens} 
                            lexemes={lexemes}
                            isLoading={isLoading} 
                        />
                    </div>
                </Card>
            </div>

            {/* Right Col: Unique Words Sidebar */}
            <div className="lg:col-span-1 h-full min-h-0">
                <TokenizerUniqueWords 
                    tokens={tokens || []}
                    onReplace={handleReplaceAll}
                />
            </div>

          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
