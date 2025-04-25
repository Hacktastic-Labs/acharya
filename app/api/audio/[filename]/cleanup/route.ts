import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const filePath = path.join("/tmp", filename);

    // Check if file exists
    if (fs.existsSync(filePath)) {
      // Delete the file
      await fs.promises.unlink(filePath);
      return NextResponse.json({
        success: true,
        message: "Audio file cleaned up successfully",
      });
    }

    // If file doesn't exist, still return success
    return NextResponse.json({
      success: true,
      message: "Audio file not found",
    });
  } catch (error) {
    console.error("Error cleaning up audio file:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to clean up audio file",
      },
      { status: 500 }
    );
  }
}

// Handle cleanup requests sent via sendBeacon
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  return DELETE(request, { params });
}
