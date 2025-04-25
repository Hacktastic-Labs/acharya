import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { generated_content } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Helper to get Gemini model (copied from flashcard-formatter)
function getGeminiModel(modelName: string = "gemini-2.0-flash") {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;
  if (!apiKey) {
    throw new Error("Missing Gemini API key");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
}

export async function POST(req: NextRequest) {
  try {
    const { message, context, history, documentId } = await req.json();

    let summaryContext = context;
    if (documentId) {
      // Try to fetch the summary for this document
      const summaryResult = await db
        .select()
        .from(generated_content)
        .where(
          and(
            eq(generated_content.documentId, documentId),
            eq(generated_content.type, "summary")
          )
        );
      if (summaryResult && summaryResult.length > 0) {
        // Summary may be stored as JSON or string
        const summaryRaw = summaryResult[0].content;
        if (typeof summaryRaw === "string") {
          summaryContext = summaryRaw;
        } else if (
          typeof summaryRaw === "object" &&
          summaryRaw !== null &&
          Object.prototype.hasOwnProperty.call(summaryRaw, "summary")
        ) {
          summaryContext = (summaryRaw as { summary: string }).summary;
        } else {
          summaryContext = JSON.stringify(summaryRaw);
        }
      }
    }

    // Use the helper to get the model
    const model = getGeminiModel();

    // Prepare chat history
    const mappedHistory = history
      ? history.slice(0, -1).map((msg: any) => ({
          role: msg.role === "user" ? "user" : "model", // Map roles
          parts: [{ text: msg.content }], // Ensure 'parts' is an array
        }))
      : [];

    // Filter history to start with 'user' and alternate roles
    let startIndex = 0;
    while (
      startIndex < mappedHistory.length &&
      mappedHistory[startIndex].role !== "user"
    ) {
      startIndex++;
    }

    const validChatHistory = mappedHistory
      .slice(startIndex)
      .filter(
        (
          msg: { role: string; parts: { text: string }[] },
          index: number,
          arr: { role: string; parts: { text: string }[] }[]
        ) => {
          // Keep the first message if it's 'user'
          if (index === 0) return true;
          // Keep subsequent messages only if the role differs from the previous one
          return msg.role !== arr[index - 1].role;
        }
      );

    // Start the chat
    const chat = model.startChat({
      history: validChatHistory, // Use the filtered and validated history
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        responseMimeType: "text/plain",
      },
    });

    // Prepare the prompt with context
    const prompt = summaryContext
      ? `Context: ${summaryContext}\n\nUser Question: ${message}`
      : message;

    // Generate response
    const result = await chat.sendMessage(prompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
