import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { generated_content } from "@/db/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { url, sessionId, userId } = await request.json();

    if (!url || !sessionId || !userId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // In a real application, you would:
    // 1. Download the YouTube video transcript
    // 2. Process it with Gemini
    // 3. Store the generated content

    // For now, we'll use a mock response
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Generate summary
    const summaryPrompt = `Generate a summary of this YouTube video (${url}): [CONTENT]`;
    const summaryResult = await model.generateContent(summaryPrompt);
    const summary = await summaryResult.response.text();

    // Generate flashcards
    const flashcardsPrompt = `Generate flashcards from this YouTube video (${url}): [CONTENT]`;
    const flashcardsResult = await model.generateContent(flashcardsPrompt);
    const flashcards = await flashcardsResult.response.text();

    // Generate podcast script
    const podcastPrompt = `Generate a podcast script from this YouTube video (${url}): [CONTENT]`;
    const podcastResult = await model.generateContent(podcastPrompt);
    const podcast = await podcastResult.response.text();

    // Store the generated content
    const [newContent] = await db
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
      .$returningId();

    return NextResponse.json({
      success: true,
      content: newContent,
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
