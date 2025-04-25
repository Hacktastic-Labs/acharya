import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const { filename } = await request.json();

    if (!filename) {
      return NextResponse.json(
        { success: false, message: "Filename is required" },
        { status: 400 }
      );
    }

    const filePath = path.join("/tmp", filename);
    console.log("Checking file existence at:", filePath);

    if (!fs.existsSync(filePath)) {
      console.log("File not found at:", filePath);
      return NextResponse.json(
        { success: false, message: "File not found" },
        { status: 404 }
      );
    }

    const stats = fs.statSync(filePath);
    console.log("File stats:", {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
    });

    return NextResponse.json({
      success: true,
      message: "File exists",
      details: {
        path: filePath,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
      },
    });
  } catch (error) {
    console.error("Error confirming audio file:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error checking file",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
