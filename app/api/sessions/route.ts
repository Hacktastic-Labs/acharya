// app/api/sessions/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"; // Needed for GET handler (and potentially POST if you validate server-side)
import { db } from "@/db"; // Your Drizzle db instance
import { sessions } from "@/db/schema"; // Your sessions table schema
import { eq, desc } from "drizzle-orm"; // Drizzle functions

// --- POST Handler: Create a new session ---
export async function POST(request: NextRequest) {
  try {
    // 1. Parse Request Body
    // Note: You get userId from the body here. Ensure this matches how you send it from the client.
    // Alternatively, you could use `auth()` here too for server-side validation.
    const { userId, title, description } = await request.json();

    // 2. Validate Input
    if (!userId) {
      // Consider using `auth()` here instead to get the definitive userId server-side
      return NextResponse.json(
        {
          success: false,
          message:
            "User ID is required in request body (or use server-side auth)",
        },
        { status: 400 }
      );
    }
    if (!title) {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      );
    }

    console.log("Attempting to create session with data:", {
      userId,
      title,
      description,
    });

    // 3. Insert into Database and get the created session using PostgreSQL's RETURNING clause
    const insertResult = await db
      .insert(sessions)
      .values({
        userId, // Ensure this userId is validated/trusted
        title,
        description: description || "", // Use provided description or default to empty string
      })
      .returning();

    // 4. Get the newly created session from the result
    const newSession = insertResult[0];

    // 5. Verify session was created
    if (!newSession || !newSession.id) {
      console.error("Insert failed or session was not returned:", insertResult);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create session",
        },
        { status: 500 }
      );
    }

    console.log("Session created successfully:", newSession);

    // 8. Return Success Response
    return NextResponse.json(
      { success: true, session: newSession },
      { status: 201 }
    ); // Use 201 Created status
  } catch (error) {
    // 9. Handle Generic Errors
    console.error("Error in POST /api/sessions:", error); // Log the full caught error
    return NextResponse.json(
      {
        success: false,
        message: "Error creating session",
        // Provide error details in development, potentially mask in production
        error: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}

// --- GET Handler: Fetch sessions for the authenticated user ---
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate User
    const session = await auth(); // Get user session from Clerk

    if (!session?.userId) {
      // User not logged in or session invalid
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.userId;
    console.log("Fetching sessions for user:", userId);

    // 2. Fetch Sessions from Database
    const userSessions = await db
      .select() // Select all columns
      .from(sessions) // From the sessions table
      .where(eq(sessions.userId, userId)) // Where userId matches the authenticated user
      .orderBy(desc(sessions.createdAt)); // Order by creation date, newest first

    console.log(
      "Found sessions for user:",
      userId,
      "Count:",
      userSessions.length
    );

    // 3. Return Success Response
    return NextResponse.json({ success: true, sessions: userSessions });
  } catch (error) {
    // 4. Handle Generic Errors
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching sessions",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
