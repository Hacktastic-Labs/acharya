import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, purchases, marketplace_listings } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

// POST: Record a purchase
export async function POST(req: NextRequest) {
  try {
    const { address, listing_id, name } = await req.json();
    if (!address || !listing_id) {
      return NextResponse.json({ error: "Missing address or listing_id" }, { status: 400 });
    }
    // Find or create user
    let user = await db.select().from(users).where(eq(users.address, address)).then((rows: any[]) => rows[0]);
    if (!user) {
      await db.insert(users).values({ address, name: name || null });
      user = await db.select().from(users).where(eq(users.address, address)).then((rows: any[]) => rows[0]);
    }
    // Check if already purchased
    const already = await db
      .select()
      .from(purchases)
      .where(and(eq(purchases.user_id, user.id), eq(purchases.listing_id, listing_id)))
      .then((rows: any[]) => rows[0]);
    if (already) {
      return NextResponse.json({ message: "Already purchased" }, { status: 200 });
    }
    // Record purchase
    await db.insert(purchases).values({ user_id: user.id, listing_id });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST /api/purchase error:", err);
    return NextResponse.json({ error: "Failed to record purchase", details: err?.message || String(err) }, { status: 500 });
  }
}

// GET: Fetch all purchases for a user by address
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");
    if (!address) {
      return NextResponse.json({ error: "Missing address" }, { status: 400 });
    }
    // Find user
    const user = await db.select().from(users).where(eq(users.address, address)).then((rows: any[]) => rows[0]);
    if (!user) {
      return NextResponse.json({ purchases: [] });
    }
    // Get all purchased listing_ids
    const purchased = await db.select().from(purchases).where(eq(purchases.user_id, user.id));
    const listingIds = purchased.map((p: any) => p.listing_id);
    let listings: any[] = [];
    if (listingIds.length > 0) {
      listings = await db.select().from(marketplace_listings).where(inArray(marketplace_listings.id, listingIds));
    }
    return NextResponse.json({ purchases: listings });
  } catch (err: any) {
    console.error("GET /api/purchase error:", err);
    return NextResponse.json({ error: "Failed to fetch purchases", details: err?.message || String(err) }, { status: 500 });
  }
} 