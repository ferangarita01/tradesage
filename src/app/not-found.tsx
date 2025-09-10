
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          404 - Page Not Found
        </h1>
        <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
          Oops! It looks like the page you were looking for doesn't exist.
        </p>
        <Button asChild>
          <Link href="/">Go back to the Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
