import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User, { IUser } from "@/models/User";
import Video, { IVideo } from "@/models/Video";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Fetching bookmarks for user:", session.user.id);
    await connectToDatabase();

    // 1) Videos where this user appears in the video's bookmarks array
    const byVideoBookmarks = await Video.find({ bookmarks: session.user.id })
      .sort({ createdAt: -1 })
      .lean() as unknown as IVideo[];

    console.log("Found videos with user in bookmarks:", byVideoBookmarks.length);

    // 2) Backward-compat: videos previously stored in User.bookmarks
    const user = await User.findById(session.user.id).select("bookmarks").lean<IUser | null>();
    const legacyIds: string[] = user?.bookmarks || [];

    console.log("Legacy bookmark IDs:", legacyIds.length);

    let byLegacy: IVideo[] = [];
    if (legacyIds.length > 0) {
      byLegacy = await Video.find({ _id: { $in: legacyIds } })
        .sort({ createdAt: -1 })
        .lean() as unknown as IVideo[];
    }

    // Merge unique videos (prefer byVideoBookmarks order first)
    const seen = new Set<string>();
    const merged: IVideo[] = [];

    for (const v of byVideoBookmarks) {
      const id = v._id?.toString?.() || "";
      if (!seen.has(id)) {
        seen.add(id);
        merged.push(v as IVideo);
      }
    }

    for (const v of byLegacy) {
      const id = v._id?.toString?.() || "";
      if (!seen.has(id)) {
        seen.add(id);
        merged.push(v as IVideo);
      }
    }

    console.log("Total bookmarked videos found:", merged.length);
    return NextResponse.json(merged);
  } catch (error) {
    console.error("Error fetching bookmarked videos:", error);
    return NextResponse.json({ error: "Failed to fetch bookmarked videos" }, { status: 500 });
  }
}
