"use client";

import { useState, useEffect } from "react";
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
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Loading...</h2>
        </div>
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
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Loading...</h2>
      </div>
    </div>
  );
}
