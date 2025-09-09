"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
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

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <Card className="w-[350px] h-[500px] flex flex-col shadow-2xl">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <Bot /> Sage
                </CardTitle>
                <CardDescription>Your AI Assistant</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleChat}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
            <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start gap-3",
                      message.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === 'model' && (
                        <div className="p-2 bg-primary rounded-full text-primary-foreground">
                            <Bot className="w-5 h-5" />
                        </div>
                    )}
                    <div
                      className={cn(
                        "p-3 rounded-lg max-w-[80%]",
                        message.role === 'user'
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-card border"
                      )}
                    >
                      <p className="text-sm">{message.content[0].text}</p>
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
                        <div className="p-3 rounded-lg bg-card border">
                            <p className="text-sm text-muted-foreground">Sage is thinking...</p>
                        </div>
                    </div>
                )}
              </div>
            </ScrollArea>
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask Sage anything..."
                disabled={isLoading}
                autoComplete="off"
              />
              <Button type="submit" size="icon" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={toggleChat} size="lg" className="rounded-full shadow-lg">
          <MessageCircle className="mr-2 h-6 w-6" />
          Chat with Sage
        </Button>
      )}
    </div>
  );
}
