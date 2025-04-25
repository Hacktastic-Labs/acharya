import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { marketplace_listings } from "@/db/schema";
import { desc } from "drizzle-orm";

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
    const data = await req.json();
    const { title, description, price, category, uploader, fileUrl } = data;
    if (!title || !description || price == null || !category || !uploader) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const [inserted] = await db.insert(marketplace_listings).values({
      title,
      description,
      price: price.toString(),
      category,
      uploader,
      file_url: fileUrl || null,
    });
    return NextResponse.json({ listing: inserted }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    );
  }
}
