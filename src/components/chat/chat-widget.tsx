"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, User, Loader2, X } from "lucide-react";
import { getChatResponse } from "@/app/actions";
import { cn } from "@/lib/utils";

type Message = {
  role: 'user' | 'model';
  content: { text: string }[];
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = { role: 'user', content: [{ text: inputValue }] };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const chatHistory = messages;
      const response = await getChatResponse({ message: inputValue, history: chatHistory });
      const botMessage: Message = { role: 'model', content: [{ text: response.response }] };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Failed to get chat response:", error);
      const errorMessage: Message = {
        role: 'model',
        content: [{ text: "Sorry, I couldn't get a response. Please try again." }]
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) {
    return (
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <Button onClick={toggleChat} size="lg" className="rounded-full shadow-lg text-lg px-8 py-6">
          <Sparkles className="mr-3 h-6 w-6" />
          Chat with Sage
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex flex-col p-4 sm:p-6 md:p-8">
      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto">
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4 -mr-4" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-4",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === 'model' && (
                      <div className="p-2.5 bg-primary rounded-full text-primary-foreground">
                          <Sparkles className="w-6 h-6" />
                      </div>
                  )}
                  <div
                    className={cn(
                      "p-4 rounded-xl max-w-[85%]",
                      message.role === 'user'
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-card border"
                    )}
                  >
                    <p className="text-base">{message.content[0].text}</p>
                  </div>
                   {message.role === 'user' && (
                      <div className="p-2.5 bg-muted rounded-full text-muted-foreground">
                          <User className="w-6 h-6" />
                      </div>
                  )}
                </div>
              ))}
              {isLoading && (
                  <div className="flex items-start gap-4 justify-start">
                      <div className="p-2.5 bg-primary rounded-full text-primary-foreground">
                         <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                      <div className="p-4 rounded-xl bg-card border">
                          <p className="text-base text-muted-foreground">Sage is thinking...</p>
                      </div>
                  </div>
              )}
            </div>
          </ScrollArea>
        </div>
        <div className="pt-6">
          <form onSubmit={handleSendMessage} className="relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Sage anything..."
              disabled={isLoading}
              autoComplete="off"
              className="h-14 pl-6 pr-16 rounded-full text-lg"
            />
            <Button type="submit" size="icon" disabled={isLoading} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full">
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={toggleChat} className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-muted">
        <X className="h-6 w-6" />
      </Button>
    </div>
  );
}