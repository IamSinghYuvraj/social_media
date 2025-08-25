import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Video from "@/models/Video";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const me = await User.findById(session.user.id).select("following");
    const following = me?.following || [];

    if (following.length === 0) {
      return NextResponse.json([]);
    }

    const videos = await Video.find({ userId: { $in: following } })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error fetching following feed:", error);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}
