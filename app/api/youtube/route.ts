import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { generated_content } from "@/db/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Helper function to validate YouTube URLs
function isValidYouTubeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);

    // Check for youtube.com URLs
    if (
      urlObj.hostname === "www.youtube.com" ||
      urlObj.hostname === "youtube.com"
    ) {
      // Check for /watch?v= format
      const videoId = urlObj.searchParams.get("v");
      return videoId !== null && videoId.length > 0;
    }

    // Check for youtu.be URLs (short format)
    if (urlObj.hostname === "youtu.be") {
      const videoId = urlObj.pathname.slice(1); // Remove leading slash
      return videoId.length > 0;
    }

    return false;
  } catch {
    return false; // Invalid URL format
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, sessionId, userId } = await request.json();

    if (!url || !sessionId || !userId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate YouTube URL
    if (!isValidYouTubeUrl(url)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid YouTube URL. Please provide a valid youtube.com or youtu.be URL.",
        },
        { status: 400 }
      );
    }

    // Process YouTube video directly with Gemini using fileUri
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Generate summary
    const summaryPrompt = `Please provide a detailed summary of this YouTube video, highlighting the main arguments, topics, and conclusions:`;
    const summaryResult = await model.generateContent([
      summaryPrompt,
      {
        fileData: {
          fileUri: url,
          mimeType: "video/*",
        },
      },
    ]);
    const summary = await summaryResult.response.text();

    // Generate flashcards
    const flashcardsPrompt = `Generate concise flashcards (question/answer format) covering the key points of this YouTube video:`;
    const flashcardsResult = await model.generateContent([
      flashcardsPrompt,
      {
        fileData: {
          fileUri: url,
          mimeType: "video/*",
        },
      },
    ]);
    const flashcards = await flashcardsResult.response.text();

    // Generate podcast script
    const podcastPrompt = `Create a comprehensive spoken monologue by a single speaker (named Alex) discussing the key points from this YouTube video. Make it sound natural and conversational, as if Alex is presenting a podcast episode.`;
    const podcastResult = await model.generateContent([
      podcastPrompt,
      {
        fileData: {
          fileUri: url,
          mimeType: "video/*",
        },
      },
    ]);
    const podcast = await podcastResult.response.text();

    // Store the generated content
    const newContent = await db
      .insert(generated_content)
      .values({
        userId,
        sessionId,
        type: "youtube",
        content: {
          summary,
          flashcards,
          podcast,
        },
      })
      .returning();

    return NextResponse.json({
      success: true,
      content: newContent[0],
    });
  } catch (error) {
    console.error("Error in YouTube route:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error processing YouTube video",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
