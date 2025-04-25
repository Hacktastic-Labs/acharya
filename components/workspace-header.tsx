"use client";

import Link from "next/link";
import { Brain } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserButton } from "@clerk/nextjs";

export function WorkspaceHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Acharya</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium hover:text-primary"
          >
            Dashboard
          </Link>
          <Link
            href="/flashcards"
            className="text-sm font-medium hover:text-primary"
          >
            Flashcards
          </Link>
          <Link
            href="/summaries"
            className="text-sm font-medium hover:text-primary"
          >
            Summaries
          </Link>
          <Link
            href="/podcasts"
            className="text-sm font-medium hover:text-primary"
          >
            Podcasts
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}
