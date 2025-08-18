import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Video from "@/models/Video";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Get user's videos to calculate stats
    const userVideos = await Video.find({ userId: session.user.id }).lean();
    
    const stats = {
      videosPosted: userVideos.length,
      totalLikes: userVideos.reduce((sum, video) => sum + (video.likes?.length || 0), 0),
      totalComments: userVideos.reduce((sum, video) => sum + (video.comments?.length || 0), 0),
      totalViews: 0 // We don't have views tracking yet, but keeping for future
    };

    // Update user's stats in database
    await User.findByIdAndUpdate(session.user.id, { stats }, { upsert: true });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
