import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    if (!filename) {
      return new NextResponse("File not found", { status: 404 });
    }

    const filePath = path.join("/tmp", filename);
    console.log("Looking for audio file at:", filePath);

    if (!fs.existsSync(filePath)) {
      console.log("Audio file not found at:", filePath);
      return new NextResponse("File not found", { status: 404 });
    }

    const fileBuffer = await fs.promises.readFile(filePath);
    console.log(
      "Successfully read audio file, size:",
      fileBuffer.length,
      "bytes"
    );

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
