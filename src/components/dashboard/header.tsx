import { Wallet } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
      <div className="flex items-center gap-3">
        <Wallet className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          TradeSage
        </h1>
      </div>
    </header>
  );
}
