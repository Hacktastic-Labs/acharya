import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@deepgram/sdk";
import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";

// Function to generate audio from text using Deepgram
async function generateTestAudio(text: string): Promise<string | null> {
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
    if (text.length > MAX_CHARACTER_LIMIT) {
      console.warn(
        `Text exceeds ${MAX_CHARACTER_LIMIT} character limit. Truncating...`
      );
      text = text.substring(0, MAX_CHARACTER_LIMIT);
    }

    const deepgram = createClient(deepgramApiKey);

    // Create a unique filename with a timestamp and random string for uniqueness
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(7);
    const outputFileName = `test-${timestamp}-${randomString}.mp3`;

    console.log("Test audio generation parameters:");
    console.log("- API Key exists:", !!deepgramApiKey);
    console.log("- Text length:", text.length);
    console.log("- Output filename:", outputFileName);

    console.log("Making Deepgram request...");
    const response = await deepgram.speak.request(
      { text },
      { model: "aura-arcas-en" }
    );
    console.log("Deepgram response received");

    const stream = await response.getStream();
    if (stream) {
      console.log("Got audio stream from Deepgram");

      // Convert Web Stream to Node.js Buffer
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

      // Get the audio buffer
      const buffer = Buffer.concat(chunks);

      // Upload the buffer to Vercel Blob
      if (buffer.length > 0) {
        try {
          const blob = await put(outputFileName, buffer, {
            access: "public",
            contentType: "audio/mpeg",
          });
          console.log(`Test audio uploaded to Vercel Blob: ${blob.url}`);
          // Return the public URL from Vercel Blob
          return blob.url;
        } catch (uploadError) {
          console.error(
            "Error uploading test audio to Vercel Blob:",
            uploadError
          );
          return null; // Return null if upload fails
        }
      } else {
        console.error("Generated test audio buffer is empty.");
        return null;
      }
    } else {
      console.error("Error generating audio: No stream returned");
      return null;
    }
  } catch (error) {
    console.error("Error generating test audio with Deepgram:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get body data
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    console.log(
      `Test audio generation request received with text length: ${text.length}`
    );

    // Generate audio from the text
    const audioPath = await generateTestAudio(text);

    if (!audioPath) {
      return NextResponse.json(
        {
          error: "Failed to generate test audio",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      audioPath,
      message: "Test audio generated successfully",
    });
  } catch (error) {
    console.error("Error in test audio API:", error);
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
