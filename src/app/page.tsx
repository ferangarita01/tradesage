"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/header";
import { ChartCard } from "@/components/dashboard/chart-card";
import PatternDetector from "@/components/dashboard/pattern-detector";
import { ChatWidget } from "@/components/chat/chat-widget";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelRightClose } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");

  // Datos de ejemplo para el detector de patrones
  // Reemplaza esto con tu hook usePrices() cuando esté listo
  const mockCandleData = [
    { open: 45000, high: 46000, low: 44500, close: 45800 },
    { open: 45800, high: 47000, low: 45200, close: 46500 },
    { open: 46500, high: 47500, low: 46000, close: 47200 },
    { open: 47200, high: 48000, low: 46800, close: 47000 },
    { open: 47000, high: 47800, low: 46200, close: 46800 },
    // Agrega más datos reales aquí
  ];

  const handlePatternsDetected = (patterns: any[]) => {
    console.log('Patrones detectados para', selectedSymbol, ':', patterns);
  };

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
              <PatternDetector 
                candles={mockCandleData}
                onPatternsDetected={handlePatternsDetected}
              />
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
