// /app/api/process/route.js
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { generated_content } from "@/db/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { fileId, sessionId, userId } = await request.json();

    if (!fileId || !sessionId || !userId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // In a real application, you would:
    // 1. Get the file content from storage
    // 2. Process it with Gemini
    // 3. Store the generated content

    // For now, we'll use a mock response
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Generate summary
    const summaryPrompt =
      "Generate a summary of the following content: [CONTENT]";
    const summaryResult = await model.generateContent(summaryPrompt);
    const summary = await summaryResult.response.text();

    // Generate flashcards
    const flashcardsPrompt =
      "Generate flashcards from the following content: [CONTENT]";
    const flashcardsResult = await model.generateContent(flashcardsPrompt);
    const flashcards = await flashcardsResult.response.text();

    // Generate podcast script
    const podcastPrompt =
      "Generate a podcast script from the following content: [CONTENT]";
    const podcastResult = await model.generateContent(podcastPrompt);
    const podcast = await podcastResult.response.text();

    // Store the generated content
    const [newContent] = await db
      .insert(generated_content)
      .values({
        userId,
        sessionId,
        type: "generated",
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
    console.error("Error in process route:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error processing content",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
