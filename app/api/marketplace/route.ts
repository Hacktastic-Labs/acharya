import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { marketplace_listings } from "@/db/schema";
import { desc } from "drizzle-orm";
import { put } from "@vercel/blob";

// export const runtime = "edge"; // Removed edge runtime

// GET: Fetch all listings
export async function GET() {
  try {
    const listings = await db
      .select()
      .from(marketplace_listings)
      .orderBy(desc(marketplace_listings.created_at));
    return NextResponse.json({ listings });
  } catch (err: unknown) {
    console.error("GET /api/marketplace error:", err);
    return NextResponse.json(
      {
        error: "Failed to fetch listings",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

// POST: Create a new listing
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;
    const price = formData.get("price") as string | null;
    const category = formData.get("category") as string | null;
    const uploader = formData.get("uploader") as string | null;
    const file = formData.get("file") as File | null;

    if (
      !title ||
      !description ||
      price == null ||
      !category ||
      !uploader ||
      !file
    ) {
      return NextResponse.json(
        { error: "Missing required fields or file" },
        { status: 400 }
      );
    }

    const blob = await put(`marketplace/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    // Save listing to database with blob URL
    const result = await db.insert(marketplace_listings).values({
      title,
      description,
      price: price.toString(),
      category,
      uploader,
      file_url: blob.url,
    });
    // .returning(); // removed returning() as it's not supported in mysql

    // Construct the response object manually
    const newListing = {
      // id: result.insertId, // Drizzle's MySQL result might not consistently provide insertId, handle as needed
      title,
      description,
      price: price.toString(),
      category,
      uploader,
      file_url: blob.url,
      created_at: new Date(), // Add timestamp
    };

    // Return the constructed listing data
    return NextResponse.json({ listing: newListing }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/marketplace error:", err);
    return NextResponse.json(
      {
        error: "Failed to create listing",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
