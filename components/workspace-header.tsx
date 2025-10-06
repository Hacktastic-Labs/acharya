"use client";

import { useState } from "react";
import Link from "next/link";
import { Brain, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function WorkspaceHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Acharya</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Learn
          </Link>
          <Link
            href="/marketplace"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Earn
          </Link>
        </nav>

        {/* Desktop Right Section */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>

        {/* Mobile Right Section with Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <UserButton afterSignOutUrl="/" />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            className="ml-2"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <nav className="container py-4 flex flex-col space-y-3">
            <Link
              href="/"
              className="text-sm font-medium hover:text-primary transition-colors py-2 px-4 rounded-md hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:text-primary transition-colors py-2 px-4 rounded-md hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              Learn
            </Link>
            <Link
              href="/marketplace"
              className="text-sm font-medium hover:text-primary transition-colors py-2 px-4 rounded-md hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              Earn
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
