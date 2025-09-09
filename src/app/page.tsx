
"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/header";
import { ChartCard } from "@/components/dashboard/chart-card";
import { AlertsCard } from "@/components/dashboard/alerts-card";
import { ChatWidget } from "@/components/chat/chat-widget";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelRightClose } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 transition-all duration-300">
          <div className="grid gap-6 md:gap-8">
            <div className="col-span-1">
              <ChartCard
                symbol={selectedSymbol}
                onSymbolChange={setSelectedSymbol}
              />
            </div>
            <div className="grid gap-6 md:gap-8 grid-cols-1">
                <AlertsCard />
            </div>
          </div>
        </main>
        <aside
          className={cn(
            "border-l border-border flex flex-col transition-all duration-300",
            isChatOpen ? "w-[30rem]" : "w-0"
          )}
        >
          {isChatOpen && <ChatWidget />}
        </aside>
        <div className="absolute bottom-4 right-4 z-10">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="rounded-full"
          >
            {isChatOpen ? (
              <PanelRightClose className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
