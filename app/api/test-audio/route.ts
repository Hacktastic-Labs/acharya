import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@deepgram/sdk";
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

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

    // In Vercel, we'll store files in /tmp
    const outputDir = path.join("/tmp");
    const outputPath = path.join(outputDir, outputFileName);
    // The public path will be served through our API
    const publicPath = `/api/audio/${outputFileName}`;

    console.log("Test audio generation parameters:");
    console.log("- API Key exists:", !!deepgramApiKey);
    console.log("- Text length:", text.length);
    console.log("- Output directory:", outputDir);
    console.log("- Output file:", outputFileName);

    // Ensure the directory exists
    try {
      await fs.promises.mkdir(outputDir, { recursive: true });
      console.log("Verified temp directory exists");
    } catch (error) {
      console.error("Error creating directory:", error);
      throw new Error("Failed to create temp directory");
    }

    console.log("Making Deepgram request...");
    const response = await deepgram.speak.request(
      { text },
      { model: "aura-arcas-en" }
    );
    console.log("Deepgram response received");

    const stream = await response.getStream();
    if (stream) {
      console.log("Got audio stream from Deepgram");
      const file = fs.createWriteStream(outputPath);

      // Convert Web Stream to Node.js Readable stream
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

      // Create a readable stream from the chunks
      const buffer = Buffer.concat(chunks);
      const nodeStream = Readable.from(buffer);

      // Pipe to file using Node.js streams
      await pipeline(nodeStream, file);

      console.log(`Audio file written to ${outputPath}`);

      // Double check file exists
      const fileExists = fs.existsSync(outputPath);
      const fileSize = fileExists ? fs.statSync(outputPath).size : 0;
      console.log(`File exists: ${fileExists}, Size: ${fileSize} bytes`);

      // Store the file path in a Map with timestamp for cleanup
      audioFiles.set(outputFileName, {
        path: outputPath,
        timestamp: Date.now(),
      });

      return publicPath;
    } else {
      console.error("Error generating audio: No stream returned");
      return null;
    }
  } catch (error) {
    console.error("Error generating test audio with Deepgram:", error);
    return null;
  }
}

// Store audio file information for cleanup
const audioFiles = new Map<string, { path: string; timestamp: number }>();

// Cleanup function to remove old files (older than 1 hour)
function cleanupOldFiles() {
  const oneHourAgo = Date.now() - 3600000; // 1 hour in milliseconds
  for (const [filename, fileInfo] of audioFiles.entries()) {
    if (fileInfo.timestamp < oneHourAgo) {
      try {
        fs.unlinkSync(fileInfo.path);
        audioFiles.delete(filename);
        console.log(`Cleaned up old audio file: ${filename}`);
      } catch (error) {
        console.error(`Error cleaning up file ${filename}:`, error);
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Clean up old files before processing new request
    cleanupOldFiles();

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

// Add a GET route to serve the audio files
export async function GET(request: NextRequest) {
  try {
    const filename = request.url.split("/audio/")[1];
    if (!filename) {
      return new NextResponse("File not found", { status: 404 });
    }

    const filePath = path.join("/tmp", filename);
    if (!fs.existsSync(filePath)) {
      return new NextResponse("File not found", { status: 404 });
    }

    const fileBuffer = await fs.promises.readFile(filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error serving audio file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
