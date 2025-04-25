import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db"; // Assuming @/ is configured for your src directory
import { sessions, generated_content } from "@/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { list, del } from "@vercel/blob";

// Helper function to safely parse JSON content
// It might be better to move this to a shared utils file
const safeJsonParse = (str: any) => {
  if (typeof str !== "string") return str; // Already an object or not a string
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error("Failed to parse JSON content:", str, e);
    return null; // Or return the original string, depending on desired handling
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  // Await the params to avoid the dynamic API error
  const sessionIdString = (await params).sessionId;

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
    const initialRelatedContent = await db.query.generated_content.findMany({
      where: eq(generated_content.sessionId, sessionId),
    });

    // Initialize relatedContent with the initial fetch
    let relatedContent = initialRelatedContent;

    // --- Start: Vercel Blob Listing Logic ---
    let audioBlobs = [];
    try {
      const blobPrefix = `monologues/${sessionId}/`;
      const listResult = await list({
        prefix: blobPrefix,
      });
      audioBlobs = listResult.blobs;
      console.log(
        `Found ${audioBlobs.length} blobs for prefix ${blobPrefix}:`,
        audioBlobs.map((b) => b.pathname)
      );

      // --- Start DB Sync Logic ---
      const monologueType = "monologue"; // Or podcast, adjust as needed

      // Filter initial content to only get relevant type (monologues)
      const existingMonologues = initialRelatedContent.filter(
        (item) => item.type === monologueType
      );

      // Create a map for quick lookup: pathname -> record
      const existingMonologuesMap = new Map<
        string,
        typeof generated_content.$inferSelect
      >();
      existingMonologues.forEach((item) => {
        const content = safeJsonParse(item.content);
        // Use pathname stored in content, if available
        if (content?.pathname && typeof content.pathname === "string") {
          existingMonologuesMap.set(content.pathname, item);
        } else {
          // Fallback or logging if pathname isn't stored correctly
          console.warn(
            `Monologue record ID ${item.id} missing valid pathname in content.`
          );
        }
      });

      const updatesToMake: { id: number; content: any }[] = [];
      const insertsToMake: (typeof generated_content.$inferInsert)[] = [];

      for (const blob of audioBlobs) {
        const existingRecord = existingMonologuesMap.get(blob.pathname);
        const newContent = { audioUrl: blob.url, pathname: blob.pathname };

        if (existingRecord) {
          // Blob exists in DB, check if update needed
          const existingContent = safeJsonParse(existingRecord.content);
          if (existingContent?.audioUrl !== blob.url) {
            updatesToMake.push({ id: existingRecord.id, content: newContent });
          }
          // Remove from map, indicating it's been processed and should NOT be deleted
          existingMonologuesMap.delete(blob.pathname);
        } else {
          // Blob not in DB, needs insert
          insertsToMake.push({
            sessionId: sessionId,
            userId: session.userId, // Assuming session fetch was successful
            type: monologueType,
            content: newContent,
          });
        }
      }

      // Records remaining in the map are in DB but not in Blob storage anymore
      const idsToDelete = Array.from(existingMonologuesMap.values()).map(
        (item) => item.id
      );

      // Perform DB operations (consider wrapping in a transaction if your DB driver supports it)
      let syncError = null;
      try {
        if (insertsToMake.length > 0) {
          console.log(
            `Inserting ${insertsToMake.length} new monologue records.`
          );
          await db.insert(generated_content).values(insertsToMake);
        }
        if (updatesToMake.length > 0) {
          console.log(`Updating ${updatesToMake.length} monologue records.`);
          // Drizzle requires updates one by one or complex SQL
          for (const update of updatesToMake) {
            await db
              .update(generated_content)
              .set({ content: update.content })
              .where(eq(generated_content.id, update.id));
          }
        }
        if (idsToDelete.length > 0) {
          console.log(
            `Deleting ${idsToDelete.length} stale monologue records.`
          );
          // Also delete the corresponding blobs from storage
          const pathnamesToDelete = Array.from(existingMonologuesMap.keys());
          if (pathnamesToDelete.length > 0) {
            console.log(
              `Deleting ${pathnamesToDelete.length} blobs from storage.`
            );
            await del(pathnamesToDelete); // Assuming del accepts an array of pathnames
          }
          await db
            .delete(generated_content)
            .where(inArray(generated_content.id, idsToDelete));
        }
      } catch (dbError) {
        console.error("Error during DB sync operations:", dbError);
        syncError = dbError; // Store error to potentially return
      }

      // Refetch content *after* sync if any changes were made
      relatedContent = await db.query.generated_content.findMany({
        where: eq(generated_content.sessionId, sessionId),
      });

      // --- End DB Sync Logic ---
    } catch (blobError) {
      console.error("Error listing blobs:", blobError);
      // Decide how to handle blob listing errors. Maybe return the session data anyway?
      // For now, we continue but log the error.
      // No need to reassign here, relatedContent already holds initialRelatedContent
    }
    // --- End: Vercel Blob Listing Logic ---

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
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const sessionIdString = (await params).sessionId;

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
