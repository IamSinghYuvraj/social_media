import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Video from "@/models/Video";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    const { id } = await params;

    const user = await User.findById(id).select(
      "username profilePicture followers following email"
    );
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const videosCount = await Video.countDocuments({ userId: id });

    const isFollowing = session?.user?.id
      ? (user.followers || []).includes(session.user.id)
      : false;

    return NextResponse.json({
      _id: user._id?.toString(),
      username: user.username,
      profilePicture: user.profilePicture || null,
      email: user.email,
      followersCount: (user.followers || []).length,
      followingCount: (user.following || []).length,
      videosCount,
      isFollowing,
    });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
