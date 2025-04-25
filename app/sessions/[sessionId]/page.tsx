"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Volume2, RefreshCw, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

// Define types without importing ReactMarkdown until it's installed
interface GeneratedContent {
  id: number;
  type: string; // 'summary', 'flashcards', 'podcast', etc.
  content: any; // Content can be JSON, string, etc.
  documentId?: number | null;
  createdAt: string;
}

interface SessionDetails {
  id: number;
  userId: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  generatedContent: GeneratedContent[];
}

// Add this function before the SessionDetailPage component
async function testAudioGeneration(text: string) {
  try {
    console.log(
      "Testing audio generation with text:",
      text.substring(0, 50) + "..."
    );

    const response = await fetch("/api/test-audio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Audio test result:", data);

    if (data.audioPath) {
      // Create a temporary audio element to test the audio
      const audio = new Audio(data.audioPath);
      audio.play().catch((e) => console.error("Error playing test audio:", e));
    }

    return data;
  } catch (error) {
    console.error("Audio test error:", error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Helper to parse JSON content safely
const parseContent = (content: any) => {
  if (typeof content === "string") {
    try {
      return JSON.parse(content);
    } catch (e) {
      return content;
    }
  }
  return content;
};

// Helper to unescape text content
const unescapeText = (text: string): string => {
  if (!text) return "";

  // Handle common escape sequences
  return (
    text
      // Newlines and whitespace
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\r/g, "\r")
      // Quotes
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      // Backslashes
      .replace(/\\\\/g, "\\")
      // Remove escape characters from markdown syntax
      .replace(/\\\*/g, "*")
      .replace(/\\\#/g, "#")
      .replace(/\\\[/g, "[")
      .replace(/\\\]/g, "]")
      .replace(/\\\(/g, "(")
      .replace(/\\\)/g, ")")
      .replace(/\\\`/g, "`")
      .replace(/\\\|/g, "|")
      .replace(/\\\</g, "<")
      .replace(/\\\>/g, ">")
      .replace(/\\\~/g, "~")
      .replace(/\\\_/g, "_")
      // Remove standalone ** characters
      .replace(/(\s|^)\*\*(\s|$)/g, "$1$2")
      .replace(/^\s*\*\*\s*/gm, "")
      .replace(/\s*\*\*\s*$/gm, "")
  );
};

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params?.sessionId;
  const [sessionData, setSessionData] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingContent, setAddingContent] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setError("Session ID not found in URL.");
      setLoading(false);
      return;
    }

    const fetchSessionDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/sessions/${sessionId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }
        const data: SessionDetails = await response.json();
        setSessionData(data);
      } catch (err) {
        console.error("Failed to fetch session details:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [sessionId]);

  // Add this new function to add sample content
  const addSampleContent = async () => {
    if (!sessionId) return;

    try {
      setAddingContent(true);
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "PUT",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      // Refresh the session data to show the new content
      const sessionResponse = await fetch(`/api/sessions/${sessionId}`);
      const updatedSession = await sessionResponse.json();
      setSessionData(updatedSession);
    } catch (err) {
      console.error("Error adding sample content:", err);
      alert(
        "Failed to add sample content: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setAddingContent(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-8 w-1/4 mb-4 bg-gray-200"></div>
        <div className="h-4 w-1/2 mb-6 bg-gray-200"></div>
        <div className="space-y-4">
          <div className="h-24 w-full bg-gray-200"></div>
          <div className="h-24 w-full bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="border border-red-500 p-4 bg-red-50">
          <h3 className="text-red-700 font-bold">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="p-8">
        <div className="border p-4">
          <h3 className="font-bold">No Session Data</h3>
          <p>Could not load session details.</p>
        </div>
      </div>
    );
  }

  // Render an audio player for monologue/podcast content
  const renderAudioPlayer = (contentItem: GeneratedContent) => {
    const content = parseContent(contentItem.content);

    // More robust audio path extraction with debugging
    let audioPath = null;
    if (typeof content === "object" && content !== null) {
      // Try various possible properties where audio URL might be stored
      audioPath = content.audioPath || content.audioUrl || content.audio;

      // If the content has a nested structure, check for audio in a 'content' property
      if (!audioPath && content.content) {
        if (typeof content.content === "object") {
          audioPath =
            content.content.audioPath ||
            content.content.audioUrl ||
            content.content.audio;
        }
      }

      // For debugging - log what we found
      console.log(
        `Content type: ${contentItem.type}, Audio path found: ${
          audioPath || "NONE"
        }`
      );
      console.log("Content structure:", content);
    }

    return (
      <div className="mt-2">
        {audioPath ? (
          <div className="mb-2">
            {/* Make sure the audio path is absolute */}
            <audio
              controls
              src={audioPath.startsWith("/") ? audioPath : `/${audioPath}`}
              className="w-full"
              preload="metadata"
            >
              Your browser does not support the audio element.
            </audio>
            <div className="mt-2 text-sm text-gray-600">
              Audio URL: {audioPath}
              <div className="ml-4 text-sm text-amber-600">
                Note: Audio regeneration is no longer available
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center mt-2">
            <span className="text-amber-700">
              Audio generation is no longer available
            </span>
          </div>
        )}
      </div>
    );
  };

  // Helper to render different content types
  const renderContent = (contentItem: GeneratedContent) => {
    const content = parseContent(contentItem.content);

    if (contentItem.type === "monologue" || contentItem.type === "podcast") {
      return renderAudioPlayer(contentItem);
    }

    let contentText = "";

    if (contentItem.type === "summary") {
      // For summaries, ensure we have proper markdown formatting
      const summaryText =
        typeof content === "string"
          ? content
          : content?.text || JSON.stringify(content);

      // Clean the text by removing unwanted characters and normalizing whitespace
      const cleanedText = summaryText
        .replace(/\*\*/g, "") // Remove ** characters
        .replace(/['"]/g, "") // Remove quotes
        .replace(/\\n/g, "\n") // Convert \n to actual newlines
        .replace(/\\t/g, "\t") // Convert \t to actual tabs
        .replace(/\\r/g, "") // Remove \r
        .trim(); // Remove extra whitespace

      // Convert plaintext to simple markdown with paragraphs
      contentText = cleanedText
        .split(/\n\s*\n/)
        .map((para: string) => para.trim())
        .filter(Boolean)
        .join("\n\n");
    } else if (contentItem.type === "flashcards") {
      if (
        Array.isArray(content) &&
        content.length > 0 &&
        typeof content[0]?.question === "string"
      ) {
        const formattedFlashcards = content.map((fc, i) => {
          // Clean the question and answer text by removing escape sequences and special characters
          const question = fc.question
            .replace(/\\n\*/g, "") // Remove \n* sequences
            .replace(/\\\*/g, "") // Remove escaped asterisks
            .replace(/\*\*/g, "") // Remove ** sequences
            .replace(/\*/g, "") // Remove single * characters
            .replace(/\\n/g, "\n") // Convert \n to actual newlines
            .replace(/\\t/g, "\t") // Convert \t to actual tabs
            .replace(/\\r/g, "") // Remove \r
            .replace(/['"]/g, "") // Remove quotes
            .trim();

          const answer = fc.answer
            .replace(/\\n\*/g, "") // Remove \n* sequences
            .replace(/\\\*/g, "") // Remove escaped asterisks
            .replace(/\*\*/g, "") // Remove ** sequences
            .replace(/\*/g, "") // Remove single * characters
            .replace(/\\n/g, "\n") // Convert \n to actual newlines
            .replace(/\\t/g, "\t") // Convert \t to actual tabs
            .replace(/\\r/g, "") // Remove \r
            .replace(/['"]/g, "") // Remove quotes
            .trim();

          return `### Question ${i + 1}\n\n${question}\n\n${answer}\n\n---\n`;
        });
        contentText = formattedFlashcards.join("");
      } else if (typeof content === "string") {
        // Clean the content first
        const cleanedContent = content
          .replace(/\\n\*/g, "") // Remove \n* sequences
          .replace(/\\\*/g, "") // Remove escaped asterisks
          .replace(/\*\*/g, "") // Remove ** sequences
          .replace(/\*/g, "") // Remove single * characters
          .replace(/\\n/g, "\n") // Convert \n to actual newlines
          .replace(/\\t/g, "\t") // Convert \t to actual tabs
          .replace(/\\r/g, "") // Remove \r
          .replace(/['"]/g, "") // Remove quotes
          .trim();

        // Try to extract flashcards from string format
        const pairs = cleanedContent
          .split(/(?:Q:|Question:)/)
          .filter(Boolean)
          .map((part) => part.trim());

        if (pairs.length > 0) {
          const extractedCards = pairs.map((pair) => {
            const [question, answer] = pair
              .split(/(?:A:|Answer:)/)
              .map((text) => (text ? text.trim() : "Unknown"));
            return {
              question: question || "Unknown question",
              answer: answer || "Unknown answer",
            };
          });
          contentText = extractedCards
            .map(
              (fc, i) =>
                `### Question ${i + 1}\n\n${fc.question}\n\n${
                  fc.answer
                }\n\n---\n`
            )
            .join("");
        } else {
          // If no Q&A format found, just clean and display the content
          contentText = cleanedContent;
        }
      } else {
        contentText = JSON.stringify(content, null, 2);
      }
    } else {
      // For other content types
      if (typeof content === "string") {
        // Clean the text by removing unwanted characters and normalizing whitespace
        contentText = content
          .replace(/\*\*/g, "") // Remove ** characters
          .replace(/['"]/g, "") // Remove quotes
          .replace(/\\n/g, "\n") // Convert \n to actual newlines
          .replace(/\\t/g, "\t") // Convert \t to actual tabs
          .replace(/\\r/g, "") // Remove \r
          .trim(); // Remove extra whitespace
      } else {
        // Format JSON with code block for better markdown rendering
        contentText = "```json\n" + JSON.stringify(content, null, 2) + "\n```";
      }
    }

    return (
      <div className="content-display">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            p: ({ node, ...props }) => <p className="mb-4" {...props} />,
            h1: ({ node, ...props }) => (
              <h1 className="text-2xl font-bold mb-4" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-xl font-bold mb-3" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-lg font-bold mb-2" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc pl-5 mb-4" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal pl-5 mb-4" {...props} />
            ),
            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
            a: ({ node, ...props }) => (
              <a className="text-blue-600 hover:underline" {...props} />
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote
                className="border-l-4 border-gray-200 pl-4 italic my-4"
                {...props}
              />
            ),
            code: ({ node, ...props }: any) =>
              props.inline ? (
                <code className="bg-gray-100 px-1 rounded" {...props} />
              ) : (
                <pre className="bg-gray-100 p-4 rounded my-4 overflow-auto">
                  <code {...props} />
                </pre>
              ),
          }}
        >
          {contentText}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-8 bg-white text-black session-detail-page">
      <div className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold mb-2">{sessionData.title}</h1>
        <p className="text-sm mb-1">
          {sessionData.description || "No description provided."}
        </p>
        <p className="text-xs text-gray-600">
          Created: {new Date(sessionData.createdAt).toLocaleString()} | Updated:{" "}
          {new Date(sessionData.updatedAt).toLocaleString()}
        </p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Generated Content</h2>
        <button
          onClick={addSampleContent}
          disabled={addingContent}
          className="px-4 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 disabled:opacity-50"
        >
          {addingContent ? "Adding..." : "Add Test Content"}
        </button>
      </div>

      {sessionData.generatedContent.length > 0 ? (
        <div className="space-y-8">
          {sessionData.generatedContent.map((contentItem) => (
            <div key={contentItem.id} className="border p-4">
              <div className="border-b pb-2 mb-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold capitalize">
                    {contentItem.type === "monologue" ||
                    contentItem.type === "podcast" ? (
                      <span className="flex items-center">
                        <Volume2 className="h-4 w-4 mr-1" />
                        {contentItem.type}
                      </span>
                    ) : (
                      contentItem.type
                    )}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {new Date(contentItem.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {renderContent(contentItem)}
            </div>
          ))}
        </div>
      ) : (
        <div className="border p-4">
          <h3 className="font-bold">No content yet</h3>
          <p>
            No generated content found for this session. Click "Add Test
            Content" to add sample content for testing.
          </p>
        </div>
      )}

      {/* Add debugging tools at the bottom of the page */}
      <div className="mt-12 pt-6 border-t border-gray-200">
        <details className="text-sm text-gray-600">
          <summary className="cursor-pointer font-medium">
            Audio Debugging Tools
          </summary>
          <div className="p-4 border mt-2">
            <h3 className="font-medium mb-2">Test Audio Generation</h3>
            <p className="mb-4 text-xs">
              This will generate a test audio file using the Deepgram API.
            </p>
            <button
              onClick={() =>
                testAudioGeneration(
                  "This is a test of the audio generation API. If you can hear this, the audio is working correctly."
                )
              }
              className="px-3 py-1 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
            >
              Test Simple Audio
            </button>
          </div>
        </details>
      </div>
    </div>
  );
}
