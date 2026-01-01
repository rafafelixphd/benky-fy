"use client";

import { AuthGuard } from "@/components/common/auth";
import { FloatingElements } from "@/components/common/layout/background";
import { NavigationHeader } from "@/components/common/layout/navigation/navigation-header";
import { Card } from "@/components/ui/card";
import { useTokenizer } from "@/lib/tokenizer/useTokenizer";
import { TokenizerEditor } from "./components/TokenizerEditor";
import { TokenizerLegend } from "./components/TokenizerLegend";

export default function TokenizerPage() {
  const { text, setText, tokens, lexemes, isLoading } = useTokenizer();

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
        <div className="relative z-10 px-6 pb-6">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-background/95 backdrop-blur-sm border-white/20 p-6 shadow-xl">
                <div className="mb-4">
                  <TokenizerLegend />
                </div>
                
                <TokenizerEditor 
                    text={text} 
                    setText={setText} 
                    tokens={tokens} 
                    lexemes={lexemes}
                    isLoading={isLoading} 
                />

                {/* <div className="mt-4 text-sm text-muted-foreground flex justify-end items-center gap-2">
                    <span>Analysis engine: </span>
                    <code className="bg-muted px-1 py-0.5 rounded text-xs">spaCy (ja_core_news_sm)</code>
                </div> */}
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
