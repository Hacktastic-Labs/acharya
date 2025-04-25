"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  Shuffle,
  RotateCcw,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  parseFlashcardsFromText,
  formatFlashcardsWithGemini,
  Flashcard,
} from "@/lib/utils/flashcard-formatter";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface InteractiveFlashcardsProps {
  flashcardsText: string;
}

export function InteractiveFlashcards({
  flashcardsText,
}: InteractiveFlashcardsProps) {
  const [parsedFlashcards, setParsedFlashcards] = useState<Flashcard[]>([]);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start with loading state
  const [error, setError] = useState<string | null>(null);
  const [formattedText, setFormattedText] = useState(flashcardsText);

  // Initial parsing of flashcards
  useEffect(() => {
    async function parseFlashcards() {
      try {
        setIsLoading(true);
        const initialParse = await parseFlashcardsFromText(flashcardsText);
        setParsedFlashcards(initialParse);
        setCards(initialParse);

        // If no cards were parsed, we'll try to reformat automatically
        if (initialParse.length === 0 && flashcardsText.trim().length > 0) {
          await handleReformatFlashcards();
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error parsing flashcards:", err);
        setError("Failed to parse flashcards. Please try reformatting.");
        setIsLoading(false);
      }
    }

    parseFlashcards();
  }, [flashcardsText]);

  // Function to reformat flashcards using Gemini
  const handleReformatFlashcards = async () => {
    if (!flashcardsText.trim()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call the server action to format the flashcards
      const formattedContent = await formatFlashcardsWithGemini(flashcardsText);
      setFormattedText(formattedContent);

      // Parse the newly formatted content
      const newFlashcards = await parseFlashcardsFromText(formattedContent);
      setParsedFlashcards(newFlashcards);
      setCards(newFlashcards);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err) {
      console.error("Error formatting flashcards:", err);
      setError("Failed to reformat flashcards. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-[300px] text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="font-medium">Processing flashcards...</p>
        <p className="text-xs text-muted-foreground mt-2">
          We're using AI to improve the structure of your flashcards.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={handleReformatFlashcards}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center p-6 bg-muted/20 rounded-lg border border-dashed border-muted-foreground/30">
        <p className="text-muted-foreground mb-4">
          No flashcards found or invalid format.
        </p>
        <Button onClick={handleReformatFlashcards} className="mb-3">
          Reformat with AI
        </Button>
        <p className="text-xs text-muted-foreground">
          Click the button above to use AI to convert this content into properly
          formatted flashcards.
        </p>
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
    setCards(parsedFlashcards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsShuffled(false);
  };

  return (
    <div className="w-full p-4 flex flex-col min-h-[400px]">
      {/* Header with controls and progress */}
      <div className="mb-4 flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
              {currentIndex + 1}/{totalCards}
            </div>
            {isShuffled && (
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                <Shuffle className="h-3 w-3 mr-1" />
                Shuffled
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShuffle}
              className="h-8 text-xs"
            >
              <Shuffle className="mr-1 h-3 w-3" />
              Shuffle
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-8 text-xs"
              disabled={!isShuffled}
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              Reset
            </Button>
          </div>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Flashcard - Using flex-grow to push navigation to bottom */}
      <div className="flex-grow mb-6">
        <div
          className="w-full perspective cursor-pointer h-[250px]"
          onClick={handleFlip}
        >
          <div
            className={`relative preserve-3d transition-transform duration-500 h-full ${
              isFlipped ? "rotate-y-180" : ""
            }`}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front of Card (Question) */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{ backfaceVisibility: "hidden" }}
            >
              <Card className="w-full h-full shadow-sm hover:shadow transition-shadow border-primary/10">
                <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="absolute top-3 right-3 inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium bg-background">
                    Question
                  </div>
                  <div className="max-w-md">
                    <h3 className="text-xl font-bold mb-4">
                      {currentCard.question}
                    </h3>
                    {!isFlipped && (
                      <div className="absolute bottom-4 left-0 right-0 text-center">
                        <p className="text-sm text-muted-foreground flex items-center justify-center">
                          <span className="inline-block animate-bounce mr-1">
                            👆
                          </span>
                          Tap to reveal answer
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Back of Card (Answer) */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <Card className="w-full h-full shadow-sm hover:shadow transition-shadow border-primary/10">
                <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="absolute top-3 right-3 inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium bg-background">
                    Answer
                  </div>
                  <div className="max-w-md overflow-y-auto max-h-[180px] scrollbar-thin">
                    <p className="text-lg">{currentCard.answer}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation buttons - Fixed at bottom */}
      <div className="flex justify-center gap-3 mt-auto">
        <Button
          variant={currentIndex === 0 ? "secondary" : "default"}
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="w-32 gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant={currentIndex === totalCards - 1 ? "secondary" : "default"}
          onClick={handleNext}
          disabled={currentIndex === totalCards - 1}
          className="w-32 gap-1"
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
