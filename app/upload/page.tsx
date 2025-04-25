// app/upload/page.tsx (or your specific route file)

"use client";

import { useState, useRef, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";

// UI Components
import { DashboardHeader } from "@/components/dashboard-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { InteractiveFlashcards } from "@/components/interactive-flashcards";

// Icons
import {
  FileText,
  Youtube,
  Upload,
  Loader2,
  Terminal,
  Info,
  Play,
  Pause,
  Volume2,
  PanelLeft,
  PanelRight,
  Bot,
} from "lucide-react";

// Server Actions & Types
import {
  uploadAndProcessDocument,
  processYouTubeVideo,
  ActionResult,
} from "@/lib/actions/gemini";

// Types
type ProcessingType = "all" | "summary" | "flashcards" | "monologue";

// --- Constants ---
const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_FILE_EXTENSIONS_STR = "PDF, DOC, DOCX, TXT"; // For display text
const ALLOWED_FILE_EXTENSIONS_ACCEPT = ".pdf,.doc,.docx,.txt"; // For input accept attribute

// --- Helper Component for Submit Button ---
function SubmitButton({ text = "Submit", pendingText = "Processing..." }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {pendingText}
        </>
      ) : (
        text
      )}
    </Button>
  );
}

// --- Helper Component for Displaying Results ---
function ResultsDisplay({ resultState }: { resultState: ActionResult | null }) {
  const [activeTab, setActiveTab] = useState<
    "flashcards" | "summary" | "monologue"
  >("flashcards");
  const [isPlaying, setIsPlaying] = useState(false);
  const [enhancedSummary, setEnhancedSummary] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Add cleanup effect
  useEffect(() => {
    if (!resultState?.audioFilePath) return;

    // Extract filename from the audio path
    const filename = resultState.audioFilePath.split("/audio/")[1];
    if (!filename) return;

    // Function to notify the server to clean up the file
    const cleanupAudio = async () => {
      try {
        await fetch(`/api/audio/${filename}/cleanup`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Error cleaning up audio file:", error);
      }
    };

    // Add event listener for when the user leaves the page
    const handleUnload = () => {
      // Using sendBeacon for more reliable cleanup during page unload
      navigator.sendBeacon(`/api/audio/${filename}/cleanup`);
    };

    window.addEventListener("beforeunload", handleUnload);

    // Cleanup function
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      cleanupAudio();
    };
  }, [resultState?.audioFilePath]);

  // Determine which tabs are available - moved outside conditional
  const availableTabs = resultState
    ? ([
        resultState.flashcardsText ? "flashcards" : null,
        resultState.summaryText ? "summary" : null,
        resultState.monologueText ? "monologue" : null,
      ].filter(Boolean) as ("flashcards" | "summary" | "monologue")[])
    : [];

  // Set active tab to the first available if current is not available
  // This useEffect must be called in every render
  useEffect(() => {
    if (
      resultState &&
      availableTabs.length > 0 &&
      !availableTabs.includes(activeTab)
    ) {
      setActiveTab(availableTabs[0]);
    }
  }, [resultState, availableTabs, activeTab]);

  // Format summary text to handle markdown better
  const formatSummaryText = (text: string) => {
    if (!text) return "";

    // Clean up special characters and formatting issues
    let cleaned = text
      .replace(/[^\w\s.,;:?!()[\]{}'"<>@#$%^&*+=\-_\\|/~`]|[^\x00-\x7F]/g, "") // Remove non-standard chars
      .replace(/\*\*/g, "") // Remove markdown bold
      .replace(/\*/g, "") // Remove markdown italics
      .replace(/`/g, "") // Remove code ticks
      .replace(/\n{3,}/g, "\n\n") // Replace multiple newlines with just two
      .trim();

    // Replace markdown bullet points with proper HTML
    let formatted = cleaned.replace(/^\s*[\-\*]\s+(.+)$/gm, "<li>$1</li>");

    // Wrap lists in ul tags
    formatted = formatted.replace(/<li>(.+?)<\/li>(\s*<li>)/g, "<li>$1</li>$2");
    formatted = formatted.replace(
      /(<li>[^]*?<\/li>)/g,
      '<ul class="list-disc pl-5 my-3">$1</ul>'
    );

    // Handle headings
    formatted = formatted.replace(
      /^#+\s+(.+)$/gm,
      '<h3 class="text-lg font-semibold my-3 text-foreground">$1</h3>'
    );

    // Handle paragraphs - ensure they have proper text color
    formatted = formatted.replace(
      /^([^<\n].+)$/gm,
      '<p class="text-foreground my-2">$1</p>'
    );

    // Remove empty paragraphs
    formatted = formatted.replace(/<p[^>]*>\s*<\/p>/g, "");

    return formatted;
  };

  // Use Gemini to enhance the summary when the tab changes to summary
  useEffect(() => {
    const enhanceSummaryWithGemini = async () => {
      if (
        activeTab === "summary" &&
        resultState?.summaryText &&
        !enhancedSummary
      ) {
        try {
          // We'll use the existing summary for now, but in a real implementation
          // you would call the Gemini API here to enhance the content
          setEnhancedSummary(formatSummaryText(resultState.summaryText));
        } catch (error) {
          console.error("Error enhancing summary:", error);
          // Fallback to formatted original summary
          setEnhancedSummary(formatSummaryText(resultState.summaryText));
        }
      }
    };

    enhanceSummaryWithGemini();
  }, [activeTab, resultState?.summaryText, enhancedSummary]);

  if (!resultState) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <PanelRight className="mr-2 h-5 w-5 text-muted-foreground" />
            Results Panel
          </h2>
        </div>
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
          <Terminal className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Waiting for input...</p>
          <p className="text-xs text-muted-foreground mt-2 max-w-md">
            Generated content (summaries, flashcards, etc.) will appear here
            after you process a file or YouTube video.
          </p>
        </div>
      </div>
    );
  }

  // Check if this is an "all" result with separate sections
  const hasMultipleSections =
    resultState.flashcardsText ||
    resultState.summaryText ||
    resultState.monologueText;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2
          className={`text-lg font-semibold flex items-center ${
            resultState.success
              ? "text-green-700 dark:text-green-500"
              : "text-red-700 dark:text-red-500"
          }`}
        >
          <PanelRight className="mr-2 h-5 w-5" />
          {resultState.success ? "Processing Successful" : "Processing Failed"}
        </h2>
      </div>
      <div className="flex-1 overflow-auto">
        <Alert
          variant={resultState.success ? "default" : "destructive"}
          className="m-4"
        >
          <AlertTitle>{resultState.success ? "Status" : "Error"}</AlertTitle>
          <AlertDescription>{resultState.message}</AlertDescription>
          {resultState.error && !resultState.success && (
            <p className="text-xs mt-2 font-mono bg-red-100 dark:bg-red-900/30 p-1 rounded inline-block">
              Details: {resultState.error}
            </p>
          )}
        </Alert>

        {hasMultipleSections && resultState.success && (
          <div className="px-4">
            {/* Navigation Tabs */}
            {availableTabs.length > 1 && (
              <div className="border-b mb-4">
                <div className="flex space-x-1">
                  {resultState.flashcardsText && (
                    <button
                      onClick={() => setActiveTab("flashcards")}
                      className={`px-4 py-2 font-medium text-sm rounded-t-md transition-colors ${
                        activeTab === "flashcards"
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <FileText className="inline-block mr-2 h-4 w-4" />
                      Flashcards
                    </button>
                  )}
                  {resultState.summaryText && (
                    <button
                      onClick={() => setActiveTab("summary")}
                      className={`px-4 py-2 font-medium text-sm rounded-t-md transition-colors ${
                        activeTab === "summary"
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <FileText className="inline-block mr-2 h-4 w-4" />
                      Summary
                    </button>
                  )}
                  {resultState.monologueText && (
                    <button
                      onClick={() => setActiveTab("monologue")}
                      className={`px-4 py-2 font-medium text-sm rounded-t-md transition-colors ${
                        activeTab === "monologue"
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <FileText className="inline-block mr-2 h-4 w-4" />
                      Monologue
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Content Panels */}
            <div className="pb-6">
              {activeTab === "flashcards" && resultState.flashcardsText && (
                <div className="bg-background rounded-md border shadow-sm">
                  <InteractiveFlashcards
                    flashcardsText={resultState.flashcardsText}
                  />
                </div>
              )}

              {activeTab === "summary" && resultState.summaryText && (
                <div className="bg-card p-4 rounded-md border text-card-foreground">
                  {enhancedSummary ? (
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none text-foreground"
                      dangerouslySetInnerHTML={{ __html: enhancedSummary }}
                    />
                  ) : (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2 text-sm">Enhancing summary...</span>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "monologue" && resultState.monologueText && (
                <div className="space-y-4">
                  {resultState.audioFilePath && (
                    <div className="bg-card p-4 rounded-md border">
                      <h3 className="font-semibold mb-2 text-base flex items-center">
                        <Volume2 className="mr-2 h-5 w-5" />
                        Listen to Monologue
                      </h3>
                      <div className="flex items-center space-x-4 bg-muted/50 p-3 rounded-md">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            if (audioRef.current) {
                              if (audioRef.current.paused) {
                                audioRef.current.play();
                                setIsPlaying(true);
                              } else {
                                audioRef.current.pause();
                                setIsPlaying(false);
                              }
                            }
                          }}
                          className="h-10 w-10 rounded-full"
                        >
                          {isPlaying ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5" />
                          )}
                        </Button>
                        <div className="flex-1">
                          <audio
                            ref={audioRef}
                            src={resultState.audioFilePath}
                            onEnded={() => setIsPlaying(false)}
                            onPause={() => setIsPlaying(false)}
                            onPlay={() => setIsPlaying(true)}
                          />
                          <div className="text-sm font-medium">
                            Generated Audio
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Click to {isPlaying ? "pause" : "play"} the
                            monologue
                          </div>
                        </div>
                      </div>

                      {/* AI Assistant Animation */}
                      <div
                        className={`mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20 ${
                          isPlaying ? "block" : "hidden"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Bot className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">AI Assistant</div>
                            <div className="text-sm text-muted-foreground">
                              {isPlaying ? (
                                <div className="flex items-center">
                                  <span>Speaking</span>
                                  <span className="ml-2 flex space-x-1">
                                    <span
                                      className="inline-block w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                                      style={{ animationDelay: "0ms" }}
                                    ></span>
                                    <span
                                      className="inline-block w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                                      style={{ animationDelay: "150ms" }}
                                    ></span>
                                    <span
                                      className="inline-block w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                                      style={{ animationDelay: "300ms" }}
                                    ></span>
                                  </span>
                                </div>
                              ) : (
                                "Ready to speak"
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="bg-card p-4 rounded-md border text-sm text-card-foreground">
                    <pre className="whitespace-pre-wrap font-sans">
                      {resultState.monologueText}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Upload Panel Component ---
function UploadPanel({
  fileInputRef,
  youtubeUrlInputRef,
  selectedFile,
  fileFormAction,
  youtubeFormAction,
  handleBrowseClick,
  handleFileChange,
  handleYoutubeUrlChange,
}: {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  youtubeUrlInputRef: React.RefObject<HTMLInputElement | null>;
  selectedFile: File | null;
  fileFormAction: (formData: FormData) => void;
  youtubeFormAction: (formData: FormData) => void;
  handleBrowseClick: () => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleYoutubeUrlChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center">
          <PanelLeft className="mr-2 h-5 w-5 text-muted-foreground" />
          Upload Content
        </h2>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="file">Upload File</TabsTrigger>
            <TabsTrigger value="youtube">YouTube Link</TabsTrigger>
          </TabsList>

          {/* File Upload Tab */}
          <TabsContent value="file" className="pt-2">
            <form action={fileFormAction} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-base font-medium">Upload Document</h3>
                <p className="text-sm text-muted-foreground">
                  Upload {ALLOWED_FILE_EXTENSIONS_STR} (max {MAX_FILE_SIZE_MB}
                  MB) to generate flashcards, summary, and monologue.
                </p>
              </div>

              {/* Consider the Label approach mentioned earlier if preferred */}
              <input
                type="file"
                name="file"
                id="file-input" // Added ID if using Label htmlFor
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept={ALLOWED_FILE_EXTENSIONS_ACCEPT}
                required
              />
              <div
                className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 text-center hover:border-primary cursor-pointer transition-colors"
                onClick={handleBrowseClick} // Keep if not using Label
                // Add appropriate aria attributes if not using Label
              >
                <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                <div className="space-y-1">
                  <h3 className="text-base font-medium break-all px-2">
                    {selectedFile
                      ? selectedFile.name
                      : "Click or drag file here"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Supports {ALLOWED_FILE_EXTENSIONS_STR} up to{" "}
                    {MAX_FILE_SIZE_MB}MB
                  </p>
                  {!selectedFile && (
                    <Button variant="outline" size="sm" className="mt-2">
                      Browse Files
                    </Button>
                  )}
                </div>
              </div>
              {selectedFile && (
                <p className="text-sm text-center text-green-600 font-medium">
                  Selected: {selectedFile.name} (
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
              <input type="hidden" name="processingOption" value="all" />
              <SubmitButton
                text="Generate Flashcards, Summary & Monologue"
                pendingText="Processing File..."
              />
            </form>
          </TabsContent>

          {/* YouTube Tab */}
          <TabsContent value="youtube" className="pt-2">
            <form action={youtubeFormAction} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-base font-medium">Add YouTube Video</h3>
                <p className="text-sm text-muted-foreground">
                  Paste a YouTube video link to generate flashcards, summary,
                  and monologue.
                  <span className="block text-xs text-amber-700 mt-1">
                    Note: Processing may take longer. Success depends on URL
                    accessibility and transcript availability.
                  </span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube-url">YouTube URL</Label>
                <Input
                  ref={youtubeUrlInputRef}
                  id="youtube-url"
                  name="youtubeUrl"
                  placeholder="https://www.youtube.com/watch?v=..." // Updated placeholder
                  required
                  type="url" // Use type="url" for basic browser validation
                  onChange={handleYoutubeUrlChange}
                />
              </div>
              {/* Simplified placeholder visual */}
              <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6 text-center bg-gray-50 dark:bg-gray-900/50">
                <Youtube className="h-10 w-10 text-red-600 mr-4" />
                <p className="text-sm text-muted-foreground">
                  Enter a valid YouTube video URL above.
                </p>
              </div>
              <input type="hidden" name="processingOption" value="all" />
              <SubmitButton
                text="Generate Flashcards, Summary & Monologue"
                pendingText="Processing Video..."
              />
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// --- Main Upload Page Component ---
export default function UploadPage() {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [processingType, setProcessingType] = useState<ProcessingType>("all");
  const [resultState, setResultState] = useState<ActionResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for file input and YouTube URL input
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const youtubeUrlInputRef = useRef<HTMLInputElement | null>(null);

  const [fileState, fileFormAction] = useFormState<
    ActionResult | null,
    FormData
  >(uploadAndProcessDocument, null);
  const [youtubeState, youtubeFormAction] = useFormState<
    ActionResult | null,
    FormData
  >(processYouTubeVideo, null);

  useEffect(() => {
    if (fileState?.inputSource === "file") {
      // Optional chaining for safety
      setResultState(fileState);
      if (fileState.success) {
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  }, [fileState]);

  useEffect(() => {
    if (youtubeState?.inputSource === "youtube") {
      // Optional chaining for safety
      setResultState(youtubeState);
      if (youtubeState.success && youtubeUrlInputRef.current) {
        youtubeUrlInputRef.current.value = "";
      }
    }
  }, [youtubeState]);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        alert(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
        setSelectedFile(null);
        event.target.value = ""; // Reset file input
        return;
      }
      // Client-side type check (supplementary to server-side)
      // Checking file.type is generally more reliable than just extension
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        // Check common edge cases like empty type for some OS/browser combos if needed
        if (
          !ALLOWED_FILE_EXTENSIONS_ACCEPT.split(",").some((ext) =>
            file.name.toLowerCase().endsWith(ext)
          )
        ) {
          alert(
            `Unsupported file type. Allowed: ${ALLOWED_FILE_EXTENSIONS_STR}.`
          );
          setSelectedFile(null);
          event.target.value = ""; // Reset file input
          return;
        }
      }
      setSelectedFile(file);
      setResultState(null);
    } else {
      setSelectedFile(null);
    }
  };

  const handleYoutubeUrlChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setYoutubeUrl(event.target.value);
    setResultState(null);
  };

  return (
    <div className="max-w-screen-xl mx-auto p-4">
      <DashboardHeader />
      <div className="mt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Upload & Process Content
          </h1>
          <p className="text-muted-foreground">
            Upload documents or YouTube videos to generate AI-powered
            flashcards, summaries, and audio monologues.
          </p>
        </div>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={40} minSize={30}>
            <UploadPanel
              fileInputRef={fileInputRef}
              youtubeUrlInputRef={youtubeUrlInputRef}
              selectedFile={selectedFile}
              fileFormAction={fileFormAction}
              youtubeFormAction={youtubeFormAction}
              handleBrowseClick={handleBrowseClick}
              handleFileChange={handleFileChange}
              handleYoutubeUrlChange={handleYoutubeUrlChange}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={60} minSize={30}>
            <ResultsDisplay resultState={resultState} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
