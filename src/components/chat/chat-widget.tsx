
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, User, Loader2, Paperclip, X } from "lucide-react";
import { getChatResponse } from "@/app/actions";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type Message = {
  role: 'user' | 'model';
  content: { text: string }[];
};

export function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
    } else {
      // TODO: Add user feedback for invalid file type
      console.warn("Please select a CSV file.");
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && !file) return;

    const userMessage: Message = { role: 'user', content: [{ text: inputValue }] };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    let csvData: string | undefined = undefined;
    if (file) {
      try {
        csvData = await fileToBase64(file);
      } catch (error) {
        console.error("Error converting file to Base64:", error);
        // Handle error, maybe show a toast
      }
    }
    
    setFile(null); // Clear file after processing

    try {
      const chatHistory = messages;
      const response = await getChatResponse({ message: inputValue, history: chatHistory, csvData });
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
    <div className="flex flex-col h-full bg-card overflow-hidden">
      <div className="p-4 border-b border-border">
          <h2 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="text-primary w-6 h-6" />
              Chat with Sage
          </h2>
      </div>
      <div className="flex-1 overflow-hidden">
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
                {message.role === 'model' && (
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
                  <p className="text-base">{message.content[0].text}</p>
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
                        <p className="text-base text-muted-foreground">Sage is thinking...</p>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
      </div>
      <div className="p-4 border-t border-border">
        {file && (
          <div className="mb-2 flex items-center justify-between bg-muted p-2 rounded-md">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Paperclip className="w-4 h-4" />
              <span className="truncate max-w-xs">{file.name}</span>
            </div>
            <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full" onClick={() => setFile(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="relative">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Sage anything..."
            disabled={isLoading}
            autoComplete="off"
            className="h-12 pl-12 pr-14 rounded-full text-base"
            suppressHydrationWarning
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            disabled={isLoading}
            onClick={() => fileInputRef.current?.click()}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />
          <Button type="submit" size="icon" disabled={isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
