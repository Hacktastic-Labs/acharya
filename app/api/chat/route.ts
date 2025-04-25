import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { generated_content } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Helper to get Gemini model (copied from flashcard-formatter)
function getGeminiModel(modelName: string = "gemini-pro") {
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
                .where(and(eq(generated_content.documentId, documentId), eq(generated_content.type, "summary")));
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
        const chatHistory = history
            ? history.slice(0, -1).map((msg: any) => ({
                  role: msg.role,
                  parts: msg.content,
              }))
            : [];

        // Start the chat
        const chat = model.startChat({
            history: chatHistory,
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7,
                topP: 0.8,
                topK: 40,
            },
        });

        // Prepare the prompt with context
        const prompt = summaryContext
            ? `Context: ${summaryContext}\n\nUser Question: ${message}`
            : message;

        // Generate response
        const result = await chat.sendMessage(prompt);
        const response = await result.response;
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