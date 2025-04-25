import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { message, context, history } = await req.json();

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Prepare chat history
    const chatHistory = history
      .slice(0, -1) // Exclude the last message as we'll send it separately
      .map((msg: any) => ({
        role: msg.role,
        parts: msg.content,
      }));

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
    const prompt = context
      ? `Context: ${context}\n\nUser Question: ${message}`
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
