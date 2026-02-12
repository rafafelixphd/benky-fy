"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Languages, ScanText, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchConversation, fetchSystemTokenization } from "../api";
import { ConversationalMessagePart, ConversationalToken, TokenizationMode, SystemToken } from "./types";
import { MessageBubble } from "./MessageBubble";
import { TokenDetailCard } from "./TokenDetailCard";
import { cn } from "@/lib/utils/utils";

type Message = {
  id: string;
  role: "user" | "agent";
  content: ConversationalMessagePart;
  timestamp: number;
  isOptimistic?: boolean;
  systemTokens?: SystemToken[]; // Store system tokens per message
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Toggles
  const [showEnglish, setShowEnglish] = useState(true);
  const [showJapanese, setShowJapanese] = useState(true);
  const [tokenizationMode, setTokenizationMode] = useState<TokenizationMode>("ai");
  const [displayMode, setDisplayMode] = useState<"surface" | "reading">("surface");
  const [selectedToken, setSelectedToken] = useState<ConversationalToken | null>(null);
  const [pinnedToken, setPinnedToken] = useState<ConversationalToken | null>(null);
  const [selectedSystemToken, setSelectedSystemToken] = useState<SystemToken | null>(null);
  const [pinnedSystemToken, setPinnedSystemToken] = useState<SystemToken | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userText = inputText.trim();
    setInputText("");
    setIsLoading(true);

    const tempId = Date.now().toString();
    const optimisticMessage: Message = {
      id: tempId,
      role: "user",
      content: {
        english: userText, // Show as english initially, will be updated
        japanese: "",
        lexicon: [],
      },
      timestamp: Date.now(),
      isOptimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const data = await fetchConversation(userText);

      setMessages((prev) => {
        const newMessages = [...prev];
        // Replace optimistic message
        const userMsgIndex = newMessages.findIndex((m) => m.id === tempId);
        if (userMsgIndex !== -1) {
          newMessages[userMsgIndex] = {
            ...newMessages[userMsgIndex],
            content: data.user_input,
            isOptimistic: false,
          };
        }

        // Add agent response
        const agentMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "agent",
          content: data.agent_response,
          timestamp: Date.now(),
        };
        newMessages.push(agentMsg);

        return newMessages;
      });

      // Fetch system tokenization if in system mode
      if (tokenizationMode === "system") {
        // Tokenize user input
        if (data.user_input.japanese) {
          const userTokenData = await fetchSystemTokenization(data.user_input.japanese);
          setMessages((prev) => {
            const updated = [...prev];
            const userMsgIndex = updated.findIndex((m) => m.id === tempId);
            if (userMsgIndex !== -1) {
              updated[userMsgIndex].systemTokens = userTokenData.tokens;
            }
            return updated;
          });
        }
        
        // Tokenize agent response
        if (data.agent_response.japanese) {
          const agentTokenData = await fetchSystemTokenization(data.agent_response.japanese);
          setMessages((prev) => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            if (lastMsg.role === "agent") {
              lastMsg.systemTokens = agentTokenData.tokens;
            }
            return updated;
          });
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Could show error toast here
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleLanguage = () => {
    if (showEnglish && showJapanese) {
      setShowEnglish(false); // Show JP only
    } else if (!showEnglish && showJapanese) {
      setShowJapanese(false);
      setShowEnglish(true); // Show EN only
    } else {
      setShowEnglish(true);
      setShowJapanese(true); // Show Both
    }
  };

  const toggleTokenization = async () => {
    if (tokenizationMode === "ai") {
      setTokenizationMode("system");
      // Fetch system tokenization for all existing messages
      const allMessages = messages.filter(m => m.content.japanese);
      
      for (const msg of allMessages) {
        try {
          const tokenData = await fetchSystemTokenization(msg.content.japanese);
          
          // Update message with its tokens
          setMessages((prev) => {
            const updated = [...prev];
            const msgIndex = updated.findIndex(m => m.id === msg.id);
            if (msgIndex !== -1) {
              updated[msgIndex].systemTokens = tokenData.tokens;
            }
            return updated;
          });
        } catch (error) {
          console.error("Failed to fetch system tokenization:", error);
        }
      }
    } else if (tokenizationMode === "system") {
      setTokenizationMode("none");
    } else {
      setTokenizationMode("ai");
    }
  };

  // Handle token selection with pinning logic
  const handleTokenSelect = (token: ConversationalToken | null) => {
    // Only update if not pinned
    if (!pinnedToken) {
      setSelectedToken(token);
    }
  };

  const handleTokenClick = (token: ConversationalToken) => {
    if (pinnedToken?.surface === token.surface) {
      // Clicking the same token unpins it
      setPinnedToken(null);
      setSelectedToken(null);
    } else {
      // Clicking a different token pins it
      setPinnedToken(token);
      setSelectedToken(token);
    }
  };

  const handleSystemTokenSelect = (token: SystemToken | null) => {
    // Only update if not pinned
    if (!pinnedSystemToken) {
      setSelectedSystemToken(token);
    }
  };

  const handleSystemTokenClick = (token: SystemToken) => {
    if (pinnedSystemToken?.token_id === token.token_id) {
      // Clicking the same token unpins it
      setPinnedSystemToken(null);
      setSelectedSystemToken(null);
    } else {
      // Clicking a different token pins it
      setPinnedSystemToken(token);
      setSelectedSystemToken(token);
    }
  };

  // Show pinned token or hovered token
  const displayedToken = pinnedToken || selectedToken;
  const displayedSystemToken = pinnedSystemToken || selectedSystemToken;

  return (
    <>
      {/* Token Detail Overlays */}
      {displayedToken && tokenizationMode === "ai" && (
         <TokenDetailCard 
           aiToken={displayedToken} 
           onClose={() => {
             setPinnedToken(null);
             setSelectedToken(null);
           }} 
         />
      )}
      {displayedSystemToken && tokenizationMode === "system" && (
         <TokenDetailCard 
           systemToken={displayedSystemToken} 
           onClose={() => {
             setPinnedSystemToken(null);
             setSelectedSystemToken(null);
           }} 
         />
      )}

      <div className="flex flex-col h-[calc(100vh-14rem)] w-full max-w-4xl mx-auto rounded-xl overflow-hidden bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-xl relative">
        {/* Header / Controls */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-zinc-900/80 border-b border-border z-10">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <MessageSquare className="w-4 h-4" />
          <span>Benky Chat</span>
        </div>

        <div className="flex items-center gap-2">
           <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="h-8 gap-2 text-xs"
          >
            <Languages className="w-3.5 h-3.5" />
            {showEnglish && showJapanese
              ? "EN + JP"
              : showEnglish
              ? "EN Only"
              : "JP Only"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setDisplayMode(displayMode === "surface" ? "reading" : "surface")}
            className="h-8 gap-2 text-xs w-20"
          >
            <span>{displayMode === "surface" ? "Kanji" : "Kana"}</span>
          </Button>
          
          <Button
            variant={tokenizationMode !== "none" ? "default" : "outline"}
            size="sm"
            onClick={toggleTokenization}
            className="h-8 gap-2 text-xs"
          >
            <ScanText className="w-3.5 h-3.5" />
            {tokenizationMode === "ai" ? "AI" : tokenizationMode === "system" ? "System" : "None"}
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth relative"
      >
        {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                <MessageSquare className="w-12 h-12 mb-2" />
                <p>Start a conversation in English or Japanese!</p>
            </div>
        )}
        
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            part={msg.content}
            isUser={msg.role === "user"}
            showEnglish={showEnglish}
            showJapanese={showJapanese}
            tokenizationMode={tokenizationMode}
            systemTokens={msg.systemTokens}
            displayMode={displayMode}
            onSelectToken={handleTokenSelect}
            onClickToken={handleTokenClick}
            onSelectSystemToken={handleSystemTokenSelect}
            onClickSystemToken={handleSystemTokenClick}
          />
        ))}

        {isLoading && (
          <div className="flex justify-start mt-4 animate-pulse">
             <div className="bg-background rounded-2xl rounded-tl-none border border-border px-4 py-3 shadow-sm">
                <span className="text-sm text-muted-foreground">Thinking...</span>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/80 dark:bg-zinc-900/80 border-t border-border">
        <div className="relative flex items-center gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (English or Japanese)"
            className="pr-12 py-6 bg-white dark:bg-zinc-950 border-input shadow-inner"
            disabled={isLoading}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={isLoading || !inputText.trim()}
            className="absolute right-1.5 h-10 w-10 shrink-0 rounded-lg"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-xs text-center mt-2 text-muted-foreground/60">
            Press Enter to send
        </div>
      </div>
      </div>
    </>
  );
}
