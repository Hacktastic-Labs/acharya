import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brain, BookOpen, Zap, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Acharya</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary">
              Home
            </Link>
            <Link href="/features" className="text-sm font-medium hover:text-primary">
              Features
            </Link>
            <SignedIn>
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
                Dashboard
              </Link>
            </SignedIn>
            <SignedOut>
              <Link href="/sign-in" className="text-sm font-medium hover:text-primary">
                Sign In
              </Link>
            </SignedOut>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-background to-background/80 py-16 md:py-24 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold">
                  Your AI Learning Assistant
                </h1>
                <p className="text-lg text-muted-foreground max-w-md">
                  Transform your learning experience with AI-powered tools for creating flashcards, summarizing documents, and more.
                </p>
                <div className="flex flex-wrap gap-4">
                  <SignedIn>
                    <Button asChild size="lg" className="rounded-full">
                      <Link href="/dashboard">Go to Workspace</Link>
                    </Button>
                  </SignedIn>
                  <SignedOut>
                    <Button asChild size="lg" className="rounded-full">
                      <Link href="/sign-in?redirect_url=/dashboard">Get Started</Link>
                    </Button>
                  </SignedOut>
                  <Button asChild variant="outline" size="lg" className="rounded-full">
                    <Link href="/about">Learn More</Link>
                  </Button>
                </div>
              </div>
              <div className="order-first md:order-last">
                <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 shadow-lg">
                  <div className="aspect-video rounded-lg bg-background p-6 shadow-inner flex items-center justify-center">
                    <Brain className="h-20 w-20 text-primary opacity-90" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Supercharge Your Learning</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Whether you're a student, professional, or lifelong learner, our AI tools help you master any subject faster.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-background rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Smart Flashcards</h3>
                <p className="text-muted-foreground mb-4">
                  Generate AI-powered flashcards from your notes, textbooks, or any learning material.
                </p>
                <Link href="/features/flashcards" className="text-primary font-medium inline-flex items-center">
                  Learn more <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>

              {/* Feature 2 */}
              <div className="bg-background rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Instant Summaries</h3>
                <p className="text-muted-foreground mb-4">
                  Transform lengthy documents into concise, easy-to-understand summaries in seconds.
                </p>
                <Link href="/features/summaries" className="text-primary font-medium inline-flex items-center">
                  Learn more <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>

              {/* Feature 3 */}
              <div className="bg-background rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="rounded-full bg-yellow-500/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-yellow-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Earn By Sharing</h3>
                <p className="text-muted-foreground mb-4">
                  Share your study materials with others and earn rewards for your contributions.
                </p>
                <Link href="/features/marketplace" className="text-primary font-medium inline-flex items-center">
                  Learn more <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-8 md:p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Learning?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                Join thousands of students who are already using Acharya to enhance their learning experience.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <SignedIn>
                  <Button asChild size="lg" className="rounded-full">
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                </SignedIn>
                <SignedOut>
                  <Button asChild size="lg" className="rounded-full">
                    <Link href="/sign-in?redirect_url=/dashboard">Get Started Now</Link>
                  </Button>
                </SignedOut>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Brain className="h-5 w-5 text-primary" />
              <span className="font-bold">Acharya</span>
            </div>
            <div className="flex gap-6">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                About
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}