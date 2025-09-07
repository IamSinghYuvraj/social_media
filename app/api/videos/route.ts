import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Video from "@/models/Video";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;
    const videos = await Video.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { caption, videoUrl, thumbnailUrl, captions = [] } = body as {
      caption?: string;
      videoUrl?: string;
      thumbnailUrl?: string;
      captions?: unknown[];
    };

    if (!caption || !videoUrl || !thumbnailUrl) {
      return NextResponse.json(
        { error: "Missing required fields (caption, videoUrl, thumbnailUrl)" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Fetch user's profile picture
    const user = await User.findById(session.user.id).select('profilePicture');
    
    const video = new Video({
      caption,
      videoUrl,
      thumbnailUrl,
      userId: session.user.id,
      userEmail: session.user.email,
      userProfilePicture: user?.profilePicture,
      likes: [],
      comments: [],
      captions,
    });

    await video.save();
    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("Error creating video:", error);
    return NextResponse.json(
      { error: "Failed to create video" },
      { status: 500 }
    );
  }
} 