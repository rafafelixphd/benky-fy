"use client";

import { useState } from "react";
import { UserMenu } from "@/components/common/layout/navigation/user-menu";
import { useAuth } from "@/core/hooks";
import { FloatingElements } from "@/components/common/layout/background";
import { Send, Bot, User, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const mockResponses = [
  {
    trigger: "how do you say",
    response: {
      content: "To say that in Japanese, you would use: ",
      translation: "Let me break down the structure for you...",
    },
  },
  {
    trigger: "what is the difference",
    response: {
      content: "That's a great question! The main difference is: ",
      translation: "Let me explain with some examples...",
    },
  },
  {
    trigger: "can you explain",
    response: {
      content: "I'll explain this concept step by step: ",
      translation: "Here's a detailed breakdown...",
    },
  },
];

const defaultResponse = {
  content: "申し訳ありませんが、もう少し具体的に質問していただけますか？",
  translation:
    "I apologize, could you please be more specific with your question?",
};

type Message = {
  role: 'user' | 'assistant';
  content: string;
  translation?: string;
};

const initialConversation: Message[] = [
  {
    role: "assistant",
    content: "こんにちは！ 日本語を練習しましょう。何を学びたいですか？",
    translation: "Hello! Let's practice Japanese. What would you like to learn?",
  },
];

export default function ChatPage() {
  const { data: authData } = useAuth();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversation, setConversation] =
    useState<Message[]>(initialConversation);

  const getMockResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    const matchedResponse = mockResponses.find((r) =>
      lowerMessage.includes(r.trigger),
    );

    if (matchedResponse) {
      return {
        content: matchedResponse.response.content + userMessage,
        translation: matchedResponse.response.translation,
      };
    }

    return defaultResponse;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isTyping) return;

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: message,
      translation: undefined,
    };
    setConversation((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    // Simulate AI typing delay
    setTimeout(() => {
      const response = getMockResponse(message);
      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.content,
          translation: response.translation,
        },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-purple to-secondary-purple relative overflow-hidden">
      <FloatingElements />

      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/home" className="flex items-center">
            <Image
              src="/logo1.webp"
              alt="BenkoFY logo"
              width={60}
              height={36}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              unoptimized
              priority
            />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-primary-foreground">
              AI Tutor Chat
            </h1>
            <p className="text-primary-foreground/80">
              Practice Japanese with AI assistance
            </p>
          </div>
        </div>

        {authData?.user && <UserMenu user={authData.user} />}
      </div>

      {/* Chat Interface */}
      <div className="relative z-10 px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-background/10 backdrop-blur-sm rounded-lg border border-primary-foreground/20 h-[calc(100vh-240px)] flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {conversation.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                      {msg.role === "user" ? (
                        <User className="w-5 h-5 text-primary-foreground" />
                      ) : (
                        <Bot className="w-5 h-5 text-primary-foreground" />
                      )}
                    </div>
                    <div
                      className={`space-y-2 ${msg.role === "user" ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`rounded-lg p-4 ${
                          msg.role === "user"
                            ? "bg-primary-purple text-white dark:bg-primary-purple/80"
                            : "bg-background/30 dark:bg-background/40 text-primary-foreground"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        {msg.translation && (
                          <p className="mt-2 text-sm opacity-80 border-t border-white/20 pt-2">
                            {msg.translation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="bg-background/30 dark:bg-background/40 rounded-lg p-4">
                      <Loader2 className="w-5 h-5 animate-spin text-primary-foreground" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="p-4 border-t border-primary-foreground/20"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask anything about Japanese..."
                  className="flex-1 bg-background/10 dark:bg-background/20 border border-primary-foreground/20 rounded-lg px-4 py-2 text-foreground dark:text-primary-foreground placeholder-foreground/60 dark:placeholder-primary-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary-purple"
                />
                <Button
                  type="submit"
                  disabled={!message.trim() || isTyping}
                  className="bg-primary-purple hover:bg-primary-purple/90"
                >
                  {isTyping ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
