// app/actions.ts
"use server";

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { createClient } from "@deepgram/sdk";
import { YoutubeTranscript } from "youtube-transcript";
import fs from "fs";
import { pipeline } from "stream/promises";
import path from "path";
import { Readable } from "stream";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { documents, sessions, generated_content } from "@/db/schema";
import { put } from "@vercel/blob";

// --- Define structure for action results (shared by both actions) ---
export interface ActionResult {
  success: boolean;
  message: string;
  resultText?: string; // To hold the generated text from Gemini
  error?: string;
  inputSource?: "file" | "youtube"; // Optional: Track which action ran
  audioFilePath?: string; // Path to the generated audio file for conversations
  flashcardsText?: string; // To hold generated flashcards
  summaryText?: string; // To hold generated summary
  monologueText?: string; // To hold generated monologue
  sessionId?: string; // To track the session ID for saved content
}

// --- Helper function to determine the prompt based on the option ---
// Updated to handle conversation generation
function getPromptForOption(
  option: string | null,
  contentType: "document" | "video"
): string {
  const contentDesc =
    contentType === "video" ? "this video" : "the attached document";
  switch (option) {
    case "flashcards":
      return `Generate concise flashcards (question/answer format) covering the key points of ${contentDesc}:`;
    case "summary":
      return `Provide a detailed summary of ${contentDesc}, highlighting the main arguments, topics, and conclusions:`;
    // --- MODIFIED CASE ---
    case "conversation":
      // Updated to request a single-speaker monologue of 1800-2000 characters
      return `Create a comprehensive spoken monologue by a single speaker (named Alex) discussing the key points from ${contentDesc}. The monologue should be between 1800-2000 characters (aim for close to 2000 but do not exceed it). Make it sound natural and conversational, as if Alex is presenting a podcast episode discussing the content. Structure the response simply as "Alex: [monologue content]" without additional formatting.`;
    // --- END MODIFICATION ---
    case "all":
      return `Process ${contentDesc} and provide: 
      1. FLASHCARDS: Generate a set of concise flashcards (question/answer format) covering the key points.
      2. SUMMARY: Provide a detailed summary highlighting the main arguments, topics, and conclusions.
      3. MONOLOGUE: Create a comprehensive spoken monologue by a single speaker (named Alex) discussing the key points. The monologue should be between 1800-2000 characters (aim for close to 2000 but do not exceed it). Make it sound natural and conversational, as if Alex is presenting a podcast episode.
      
      Format your response with clear headings (FLASHCARDS, SUMMARY, MONOLOGUE) separating each section.`;
    default: // Default or if option is missing
      return `Summarize the key information in ${contentDesc}:`;
  }
}

// --- Helper function to convert File to Gemini Part (for inline data) ---
async function fileToGenerativePart(file: File) {
  const base64EncodedData = Buffer.from(await file.arrayBuffer()).toString(
    "base64"
  );
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
}

// --- Shared Gemini Initialization Logic ---
function getGeminiModel(modelName: string = "gemini-1.5-flash") {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    console.error("GEMINI_API_KEY environment variable not set!");
    throw new Error("Server configuration error: API Key is missing.");
  }
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    return genAI.getGenerativeModel({
      model: modelName,
      // safetySettings: [ // Optional: Keep or remove safety settings as needed
      //     { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }
      // ]
    });
  } catch (error: any) {
    console.error("Error initializing Gemini SDK:", error);
    throw new Error(
      "Server configuration error: Could not initialize AI Model."
    );
  }
}

// --- Function to generate audio from conversation text using Deepgram ---
async function generateConversationAudio(
  conversationText: string
): Promise<string | null> {
  try {
    const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
    if (!deepgramApiKey) {
      console.error("DEEPGRAM_API_KEY environment variable not set!");
      throw new Error(
        "Server configuration error: Deepgram API Key is missing."
      );
    }

    // Enforce strict 2000 character limit for Deepgram
    const MAX_CHARACTER_LIMIT = 2000;
    if (conversationText.length > MAX_CHARACTER_LIMIT) {
      console.warn(
        `Conversation text exceeds ${MAX_CHARACTER_LIMIT} character limit. Truncating...`
      );
      conversationText = conversationText.substring(0, MAX_CHARACTER_LIMIT);
    }

    const deepgram = createClient(deepgramApiKey);

    // Create a unique filename with timestamp and random string for uniqueness
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(7);
    const outputFileName = `conversation-${timestamp}-${randomString}.mp3`;

    const response = await deepgram.speak.request(
      { text: conversationText },
      {
        model: "aura-arcas-en",
      }
    );

    const stream = await response.getStream();
    if (stream) {
      const chunks: Uint8Array[] = [];
      const reader = stream.getReader();

      let done = false;
      let bytesRead = 0;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          chunks.push(value);
          bytesRead += value.length;
        }
      }

      console.log(`Read ${bytesRead} bytes from stream`);

      const buffer = Buffer.concat(chunks);

      if (buffer.length > 0) {
        try {
          const blob = await put(outputFileName, buffer, {
            access: "public",
            contentType: "audio/mpeg",
          });
          console.log(`Audio file uploaded to Vercel Blob: ${blob.url}`);

          return blob.url;
        } catch (uploadError) {
          console.error("Error uploading audio to Vercel Blob:", uploadError);
          return null;
        }
      } else {
        console.error("Generated audio buffer is empty.");
        return null;
      }
    } else {
      console.error("Error generating audio: No stream returned");
      return null;
    }
  } catch (error: any) {
    console.error("Error generating audio with Deepgram:", error);
    return null;
  }
}

// Helper function to extract content from all-in-one response
function extractContentSections(text: string) {
  // Initialize with empty values
  let flashcards = "";
  let summary = "";
  let monologue = "";

  // Extract flashcards section
  const flashcardsMatch = text.match(
    /FLASHCARDS:?([\s\S]*?)(?=SUMMARY:|MONOLOGUE:|$)/i
  );
  if (flashcardsMatch && flashcardsMatch[1]) {
    flashcards = flashcardsMatch[1].trim();
  }

  // Extract summary section
  const summaryMatch = text.match(
    /SUMMARY:?([\s\S]*?)(?=FLASHCARDS:|MONOLOGUE:|$)/i
  );
  if (summaryMatch && summaryMatch[1]) {
    summary = summaryMatch[1].trim();
  }

  // Extract monologue section (might contain "Alex:" prefix)
  const monologueMatch = text.match(
    /MONOLOGUE:?([\s\S]*?)(?=FLASHCARDS:|SUMMARY:|$)/i
  );
  if (monologueMatch && monologueMatch[1]) {
    monologue = monologueMatch[1].trim();
    // If monologue contains "Alex:" prefix, keep only what follows
    const alexMatch = monologue.match(/Alex:?([\s\S]*)/i);
    if (alexMatch && alexMatch[1]) {
      monologue = alexMatch[1].trim();
    }
  }

  return { flashcards, summary, monologue };
}

// --- Function to store content in database ---
async function storeGeneratedContent(
  contentType: "flashcards" | "summary" | "monologue" | "all",
  content: {
    flashcards?: string;
    summary?: string;
    monologue?: string;
    audioPath?: string;
  },
  sourceInfo: {
    sourceType: "file" | "youtube";
    sourceName?: string; // Filename or YouTube URL
  }
): Promise<string | null> {
  try {
    // Get current user from auth
    const authResult = await auth();
    if (!authResult || !authResult.userId) {
      console.error("No authorized user found");
      return null;
    }

    const userId = authResult.userId;

    // Create a descriptive title based on source
    const title = sourceInfo.sourceName
      ? `${sourceInfo.sourceType === "file" ? "File" : "YouTube"}: ${
          sourceInfo.sourceName
        }`
      : `Content from ${sourceInfo.sourceType}`;

    // Use direct SQL query for session creation using the Drizzle SQL builder
    const sessionValues = {
      userId: userId,
      title: title,
      description: `Generated ${
        contentType === "all"
          ? "flashcards, summary, and monologue"
          : contentType
      } from ${sourceInfo.sourceType}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(sessions).values(sessionValues);

    // Get the last inserted ID using MySQL-specific query
    const result = await db.execute(`SELECT LAST_INSERT_ID() as id`);
    // The result format may vary, so we use type assertion for now
    const sessionId = parseInt((result as any)[0][0].id);

    if (!sessionId) {
      throw new Error("Failed to get session ID");
    }

    // Create a document entry using the Drizzle SQL builder
    const originalContent =
      content.summary || content.monologue || content.flashcards || "";
    const documentValues = {
      userId: userId,
      title: title,
      content: originalContent.substring(0, 1000), // Limit the content length
      fileType: sourceInfo.sourceType === "file" ? "text" : "youtube",
      fileUrl:
        sourceInfo.sourceType === "youtube" ? sourceInfo.sourceName : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(documents).values(documentValues);

    // Get the document ID
    const docResult = await db.execute(`SELECT LAST_INSERT_ID() as id`);
    const documentId = parseInt((docResult as any)[0][0].id);

    if (!documentId) {
      throw new Error("Failed to get document ID");
    }

    // Store each content type in the generated_content table
    if (contentType === "all" || contentType === "flashcards") {
      if (content.flashcards) {
        const flashcardsValues = {
          sessionId: sessionId,
          userId: userId,
          type: "flashcards",
          content: JSON.stringify(content.flashcards),
          documentId: documentId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.insert(generated_content).values(flashcardsValues);
      }
    }

    if (contentType === "all" || contentType === "summary") {
      if (content.summary) {
        const summaryValues = {
          sessionId: sessionId,
          userId: userId,
          type: "summary",
          content: JSON.stringify(content.summary),
          documentId: documentId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.insert(generated_content).values(summaryValues);
      }
    }

    if (contentType === "all" || contentType === "monologue") {
      if (content.monologue) {
        const contentObj = content.audioPath
          ? { text: content.monologue, audioPath: content.audioPath }
          : content.monologue;

        const monologueValues = {
          sessionId: sessionId,
          userId: userId,
          type: "monologue",
          content: JSON.stringify(contentObj),
          documentId: documentId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.insert(generated_content).values(monologueValues);
      }
    }

    return sessionId.toString();
  } catch (error) {
    console.error("Error storing content in database:", error);
    return null;
  }
}

// --- Helper function to fetch YouTube transcript --- (Updated implementation)
async function fetchYouTubeTranscript(url: string): Promise<string> {
  console.log(`Fetching transcript for: ${url}`);
  try {
    const transcriptResponse = await YoutubeTranscript.fetchTranscript(url);

    if (!transcriptResponse || transcriptResponse.length === 0) {
      console.log("No transcript found or transcript is empty.");
      return ""; // Return empty string if no transcript found
    }

    // Concatenate all text parts into a single string
    const fullTranscript = transcriptResponse
      .map((item) => item.text)
      .join(" ");
    console.log("Transcript fetched successfully.");
    return fullTranscript;
  } catch (error: any) {
    console.error(`Error fetching YouTube transcript for ${url}:`, error);
    // Check for specific error types from the library if needed
    if (error.message?.includes("transcript disabled")) {
      throw new Error("Transcripts are disabled for this video.");
    } else if (error.message?.includes("No transcript found")) {
      throw new Error("No transcript could be found for this video.");
    } else {
      throw new Error(
        "Failed to fetch YouTube transcript due to an unexpected error."
      );
    }
  }
}

// --- Server Action for File Uploads ---
export async function uploadAndProcessDocument(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  console.log("Server Action: uploadAndProcessDocument triggered.");
  const file = formData.get("file") as File | null;
  const processingOption = formData.get("processingOption") as string | null;

  // Validation (remains the same)
  if (!file || file.size === 0) {
    return {
      success: false,
      message: "No file provided.",
      error: "File Missing",
      inputSource: "file",
    };
  }
  if (file.size > 15 * 1024 * 1024) {
    return {
      success: false,
      message: "File exceeds 15MB limit.",
      error: "File Too Large",
      inputSource: "file",
    };
  }
  const allowedTypes = [
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      message: "Unsupported file type (PDF, DOC, DOCX, TXT only).",
      error: "Invalid File Type",
      inputSource: "file",
    };
  }

  console.log(
    `File: ${file.name}, Type: ${file.type}, Option: ${processingOption}`
  );

  try {
    const model = getGeminiModel("gemini-1.5-flash");
    const textPrompt = getPromptForOption(processingOption, "document");
    const filePart = await fileToGenerativePart(file);

    console.log("Sending file request to Gemini...");
    const result = await model.generateContent([textPrompt, filePart]);
    const response = result.response;
    const generatedText = response.text();
    console.log("Gemini response received.");

    // For "all" option, extract individual content sections
    let flashcardsText, summaryText, monologueText;
    let audioFilePath = null;

    if (processingOption === "all") {
      const sections = extractContentSections(generatedText);
      flashcardsText = sections.flashcards;
      summaryText = sections.summary;
      monologueText = sections.monologue;

      // Generate audio for the monologue part
      if (monologueText) {
        console.log("Generating audio for monologue...");
        audioFilePath = await generateConversationAudio(monologueText);
      }
    } else {
      // Generate audio if the option is "conversation"
      if (processingOption === "conversation") {
        console.log("Generating audio for conversation...");
        audioFilePath = await generateConversationAudio(generatedText);
        monologueText = generatedText;
      } else if (processingOption === "flashcards") {
        flashcardsText = generatedText;
      } else if (processingOption === "summary") {
        summaryText = generatedText;
      }
    }

    // Store the content in the database
    let sessionId = null;

    sessionId = await storeGeneratedContent(
      processingOption as any,
      {
        flashcards: flashcardsText,
        summary: summaryText,
        monologue: monologueText,
        audioPath: audioFilePath || undefined,
      },
      {
        sourceType: "file",
        sourceName: file.name,
      }
    );

    // Success message remains generic but accurate
    return {
      success: true,
      message: `Successfully processed '${file.name}' for ${
        processingOption === "all"
          ? "flashcards, summary & monologue"
          : processingOption || "summary"
      }.${audioFilePath ? " Audio generated." : ""} ${
        sessionId ? " Content saved to your account." : ""
      }`,
      resultText: generatedText,
      inputSource: "file",
      audioFilePath: audioFilePath || undefined,
      flashcardsText: flashcardsText,
      summaryText: summaryText,
      monologueText: monologueText,
      sessionId: sessionId || undefined,
    };
  } catch (error: any) {
    console.error("Error processing file with Gemini:", error);
    let errorMessage = "An unexpected error occurred during processing.";
    if (error.message.includes("SAFETY")) {
      errorMessage = "Content generation blocked due to safety settings.";
    } else if (error.message.includes("429")) {
      errorMessage = "Rate limit exceeded. Please try again later.";
    } else if (error.message.includes("API key not valid")) {
      errorMessage = "Invalid API Key.";
    } else if (error.message.includes("Could not initialize AI Model")) {
      errorMessage = error.message;
    }

    return {
      success: false,
      message: errorMessage,
      error: error.message || "Unknown API error",
      inputSource: "file",
    };
  }
}

// --- Server Action for YouTube Videos ---
export async function processYouTubeVideo(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  // --- Extract data ---
  const youtubeUrl = formData.get("youtubeUrl") as string;
  const processingOption =
    (formData.get("processingOption") as string) || "all"; // Default to 'all'

  // --- Basic Validation ---
  if (!youtubeUrl || !youtubeUrl.includes("youtube.com")) {
    return {
      success: false,
      message: "Invalid YouTube URL provided.",
      inputSource: "youtube",
    };
  }

  console.log(
    `Processing YouTube video: ${youtubeUrl} with option: ${processingOption}`
  );

  try {
    // --- Fetch Transcript ---
    const transcript = await fetchYouTubeTranscript(youtubeUrl);
    if (!transcript) {
      return {
        success: false,
        message: "Could not retrieve transcript for the video.",
        inputSource: "youtube",
      };
    }
    console.log("Transcript fetched successfully.");

    // --- Process with Gemini ---
    const model = getGeminiModel("gemini-1.5-pro");
    const prompt = getPromptForOption(processingOption, "video");

    const generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

    // Apply generationConfig to the model instance if needed, or handle within generateContent if supported for multimodal
    // Note: The SDK structure might vary. Assuming config is passed directly here.
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { text: `Video Transcript:\n\n${transcript}` },
          ],
        },
      ],
      generationConfig: generationConfig, // Pass config here
    });

    const responseText = result.response.text();

    let finalFlashcards = "";
    let finalSummary = "";
    let finalMonologue = "";

    if (processingOption === "all") {
      const { flashcards, summary, monologue } =
        extractContentSections(responseText);
      finalFlashcards = flashcards;
      finalSummary = summary;
      finalMonologue = monologue;
    } else if (processingOption === "summary") {
      finalSummary = responseText;
    } else if (processingOption === "flashcards") {
      finalFlashcards = responseText;
    } else if (processingOption === "monologue") {
      finalMonologue = responseText.replace(/^Alex:?\s*/i, "").trim();
    } else {
      finalSummary = responseText;
    }

    let audioUrl: string | null = null;
    if (finalMonologue) {
      audioUrl = await generateConversationAudio(finalMonologue);
      if (!audioUrl) {
        console.warn(
          "Failed to generate audio for the monologue, but proceeding without it."
        );
      }
    }

    const validProcessingOption = [
      "flashcards",
      "summary",
      "monologue",
      "all",
    ].includes(processingOption)
      ? (processingOption as "flashcards" | "summary" | "monologue" | "all")
      : "all";

    const sessionId = await storeGeneratedContent(
      validProcessingOption, // Use validated type
      {
        flashcards: finalFlashcards,
        summary: finalSummary,
        monologue: finalMonologue,
        audioPath: audioUrl ?? undefined, // Use undefined if null
      },
      {
        sourceType: "youtube",
        sourceName: youtubeUrl,
      }
    );

    // --- Return Success Result ---
    return {
      success: true,
      message: "YouTube video processed successfully.",
      inputSource: "youtube",
      flashcardsText: finalFlashcards, // Use extracted/assigned content
      summaryText: finalSummary, // Use extracted/assigned content
      monologueText: finalMonologue, // Use extracted/assigned content
      audioFilePath: audioUrl ?? undefined,
      sessionId: sessionId ?? undefined, // Pass session ID back to frontend
    };
  } catch (error: any) {
    console.error("Error processing YouTube URL with Gemini:", error);
    let errorMessage = "An unexpected error occurred during processing.";
    if (error.message.includes("SAFETY")) {
      errorMessage = "Content generation blocked due to safety settings.";
    } else if (error.message.includes("429")) {
      errorMessage = "Rate limit exceeded. Please try again later.";
    } else if (error.message.includes("API key not valid")) {
      errorMessage = "Invalid API Key.";
    }

    return {
      success: false,
      message: errorMessage,
      error: error.message || "Unknown API error",
      inputSource: "youtube",
    };
  }
}
