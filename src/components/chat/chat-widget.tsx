
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, User, Loader2, Bot } from "lucide-react";
import { getChatResponse } from "@/app/actions";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ChatInput, Candle } from "@/types/ai-types";

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

interface ChatWidgetProps {
  symbol?: string;
  candles?: Candle[];
}

export function ChatWidget({ symbol, candles }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState("mistral");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
          viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
        }
    }
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = { role: 'user', content: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    
    try {
      const chatInput: ChatInput = {
        message: inputValue,
        history: messages,
        model: model,
        assetName: symbol,
        candles: candles,
      };

      const response = await getChatResponse(chatInput);
      const botMessage: Message = { role: 'assistant', content: response.response };
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error("Failed to get chat response:", error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "Sorry, I couldn't get a response. Please try again."
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
                <Sparkles className="text-primary w-6 h-6" />
                Chat with TradeSage
            </h2>
            <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-muted-foreground" />
                <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="w-[180px] h-8 text-xs">
                        <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="mistral">Mistral Small</SelectItem>
                        <SelectItem value="llama">LLaMA-3-8B</SelectItem>
                        <SelectItem value="yi">Yi-34B</SelectItem>
                        <SelectItem value="gpt">GPT-4o Mini (OR)</SelectItem>
                        <SelectItem value="gpt4oMini">GPT-4o Mini (OAI)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
      </div>
      <div className="flex-1 overflow-hidden" >
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.role === 'assistant' && (
                    <div className="p-2 bg-primary rounded-full text-primary-foreground">
                        <Sparkles className="w-5 h-5" />
                    </div>
                )}
                <div
                  className={cn(
                    "p-3 rounded-xl max-w-[85%]",
                    message.role === 'user'
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-background"
                  )}
                >
                  <p className="text-base whitespace-pre-wrap">{message.content}</p>
                </div>
                 {message.role === 'user' && (
                    <div className="p-2 bg-muted rounded-full text-muted-foreground">
                        <User className="w-5 h-5" />
                    </div>
                )}
              </div>
            ))}
            {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                    <div className="p-2 bg-primary rounded-full text-primary-foreground">
                       <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                    <div className="p-3 rounded-xl bg-background">
                        <p className="text-base text-muted-foreground">TradeSage is thinking...</p>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
      </div>
      <div className="p-4 border-t border-border">
        <form onSubmit={handleSendMessage} className="relative">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about the current chart..."
            disabled={isLoading}
            autoComplete="off"
            className="h-12 pr-14 rounded-full text-base"
            suppressHydrationWarning
          />
          <Button type="submit" size="icon" disabled={isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
