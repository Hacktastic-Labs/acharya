"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Shuffle, RotateCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Sample flashcard data (replace with actual data fetching based on params.id)
const sampleFlashcards = [
  {
    id: 1,
    question: "What is Machine Learning?",
    answer:
      "A field of artificial intelligence that uses statistical techniques to give computer systems the ability to 'learn' (e.g., progressively improve performance on a specific task) from data, without being explicitly programmed.",
  },
  {
    id: 2,
    question: "What are the two main types of Supervised Learning?",
    answer: "Classification and Regression.",
  },
  {
    id: 3,
    question: "What is Unsupervised Learning?",
    answer:
      "A type of machine learning where the algorithm learns patterns from untagged data.",
  },
  {
    id: 4,
    question: "What is a common example of Clustering?",
    answer: "K-Means Clustering.",
  },
  {
    id: 5,
    question: "What does 'Overfitting' mean in ML?",
    answer:
      "A modeling error that occurs when a function is too closely fit to a limited set of data points. It may therefore fail to predict future observations reliably.",
  },
];

// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function FlashcardStudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [mounted, setMounted] = useState(false);
  const [cards, setCards] = useState(sampleFlashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering content until mounted
  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <DashboardShell>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold tracking-tight">Loading...</h2>
          </div>
        </DashboardShell>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const totalCards = cards.length;
  const progress = ((currentIndex + 1) / totalCards) * 100;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleShuffle = () => {
    setCards(shuffleArray(cards));
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsShuffled(true);
  };

  const handleReset = () => {
    setCards(sampleFlashcards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsShuffled(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <DashboardShell>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Machine Learning Basics
            </h2>
            <p className="text-muted-foreground">
              Studying {totalCards} cards • Card {currentIndex + 1} of{" "}
              {totalCards}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShuffle}>
              <Shuffle className="mr-2 h-4 w-4" />
              Shuffle
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        <Progress value={progress} className="mb-8" />

        <div className="flex justify-center mb-8">
          <div
            className="w-full max-w-3xl perspective cursor-pointer"
            onClick={handleFlip}
          >
            <div
              className={`relative preserve-3d card-flip-container h-[400px] transition-transform duration-700 ${
                isFlipped ? "rotate-y-180" : ""
              }`}
            >
              {/* Front of Card (Question) */}
              <div className="absolute inset-0 w-full h-full backface-hidden">
                <Card className="w-full h-full flex items-center justify-center p-8 text-center bg-card text-card-foreground">
                  <CardContent className="flex flex-col items-center justify-center h-full w-full">
                    <h3 className="text-2xl font-bold mb-4">
                      {currentCard.question}
                    </h3>
                    {!isFlipped && (
                      <p className="text-muted-foreground text-sm">
                        Click to reveal answer
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
              {/* Back of Card (Answer) */}
              <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
                <Card className="w-full h-full flex items-center justify-center p-8 text-center bg-card text-card-foreground">
                  <CardContent className="flex flex-col items-center justify-center h-full w-full">
                    <p>{currentCard.answer}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            size="lg"
            onClick={handleNext}
            disabled={currentIndex === totalCards - 1}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DashboardShell>
    </div>
  );
}
