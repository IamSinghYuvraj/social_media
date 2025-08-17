import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Video from "@/models/Video";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectToDatabase();
    const { userId } = await params;
    const videos = await Video.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error fetching user videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch user videos" },
      { status: 500 }
    );
  }
}