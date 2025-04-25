import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db"; // Assuming @/ is configured for your src directory
import { sessions, generated_content } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  // Await the params to avoid the dynamic API error
  const sessionIdString = params.sessionId;

  if (!sessionIdString) {
    return NextResponse.json(
      { error: "Session ID is required" },
      { status: 400 }
    );
  }

  const sessionId = parseInt(sessionIdString, 10);
  if (isNaN(sessionId)) {
    return NextResponse.json(
      { error: "Invalid Session ID format" },
      { status: 400 }
    );
  }

  try {
    // Drizzle doesn't automatically create reverse relations in the query API
    // unless defined with `relations`. We'll fetch the session first,
    // then fetch the related generated content.

    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
      // If you have relations defined using drizzle-orm's `relations` helper,
      // you could potentially use this:
      // with: {
      //   generatedContents: true // Assuming the relation name is generatedContents
      // }
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Fetch related generated content separately
    const relatedContent = await db.query.generated_content.findMany({
      where: eq(generated_content.sessionId, sessionId),
    });

    // Debug: Log what we found
    console.log(`Session ${sessionId} found:`, session);
    console.log(
      `Related content for session ${sessionId}:`,
      relatedContent.length > 0 ? "Found content" : "No content found"
    );
    if (relatedContent.length > 0) {
      console.log(
        `Content types:`,
        relatedContent.map((item: any) => item.type).join(", ")
      );
    }

    // Combine session data with its generated content
    const result = {
      ...session,
      generatedContent: relatedContent,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
  // No need to disconnect with serverless functions usually, connection pooling handles it.
}

// TEST ENDPOINT: Add sample content to a session
export async function PUT(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const sessionIdString = params.sessionId;

  if (!sessionIdString) {
    return NextResponse.json(
      { error: "Session ID is required" },
      { status: 400 }
    );
  }

  const sessionId = parseInt(sessionIdString, 10);
  if (isNaN(sessionId)) {
    return NextResponse.json(
      { error: "Invalid Session ID format" },
      { status: 400 }
    );
  }

  try {
    // 1. Check if session exists
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // 2. Create sample content entries
    const sampleContentTypes = [
      {
        type: "summary",
        content:
          "This is a sample summary of the session content. It highlights the key points that were discussed during the session.",
      },
      {
        type: "flashcards",
        content: [
          { question: "What is the main topic?", answer: "Sample topic 1" },
          {
            question: "What is an important concept?",
            answer: "Sample concept explanation",
          },
        ],
      },
      {
        type: "podcast",
        content: {
          audioUrl: "https://example.com/sample-podcast.mp3",
          title: "Sample Podcast",
          duration: "10:30",
        },
      },
    ];

    // 3. Insert the sample content
    const insertPromises = sampleContentTypes.map((sample) =>
      db.insert(generated_content).values({
        sessionId,
        userId: session.userId,
        type: sample.type,
        content: sample.content,
      })
    );

    await Promise.all(insertPromises);

    // 4. Return success
    return NextResponse.json({
      success: true,
      message: "Sample content created for session",
      contentTypes: sampleContentTypes.map((c) => c.type),
    });
  } catch (error) {
    console.error("Error creating sample content:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
