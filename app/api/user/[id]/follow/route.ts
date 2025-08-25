import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: targetId } = await params;
    const currentUserId = session.user.id;
    if (targetId === currentUserId) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    await connectToDatabase();

    const currentUser = await User.findById(currentUserId).select("following");
    const targetUser = await User.findById(targetId).select("followers");
    if (!currentUser || !targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const alreadyFollowing = (currentUser.following || []).includes(targetId);

    if (alreadyFollowing) {
      // Unfollow
      await User.updateOne(
        { _id: currentUserId },
        { $pull: { following: targetId } }
      );
      await User.updateOne(
        { _id: targetId },
        { $pull: { followers: currentUserId } }
      );
    } else {
      // Follow
      await User.updateOne(
        { _id: currentUserId },
        { $addToSet: { following: targetId } }
      );
      await User.updateOne(
        { _id: targetId },
        { $addToSet: { followers: currentUserId } }
      );
    }

    const updatedTarget = await User.findById(targetId).select(
      "followers following"
    );

    return NextResponse.json({
      isFollowing: !alreadyFollowing,
      followersCount: (updatedTarget?.followers || []).length,
      followingCount: (updatedTarget?.following || []).length,
    });
  } catch (error) {
    console.error("Follow/unfollow error:", error);
    return NextResponse.json({ error: "Failed to update follow state" }, { status: 500 });
  }
}
