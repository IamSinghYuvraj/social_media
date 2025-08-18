import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Video from "@/models/Video";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const { id } = await params;
    const video = await Video.findById(id).lean();
    
    if (!video) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error("Error fetching video:", error);
    return NextResponse.json(
      { error: "Failed to fetch video" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { id } = await params;
    const video = await Video.findById(id);
    if (!video) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    if (video.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await video.deleteOne();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, ...data } = body;

    await connectToDatabase();
    const { id } = await params;
    const video = await Video.findById(id);

    if (!video) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    switch (action) {
      case "like":
        const userId = session.user.id;
        const isLiked = video.likes.includes(userId);
        
        if (isLiked) {
          video.likes = video.likes.filter((id: string) => id !== userId);
        } else {
          video.likes.push(userId);
        }
        break;

      case "comment":
        const { text } = data;
        if (!text || text.trim().length === 0) {
          return NextResponse.json(
            { error: "Comment text is required" },
            { status: 400 }
          );
        }

        // Fetch user's profile picture for the comment
        const user = await User.findById(session.user.id).select('profilePicture');

        video.comments.push({
          userId: session.user.id,
          userEmail: session.user.email,
          userProfilePicture: user?.profilePicture,
          text: text.trim(),
        });
        break;


      case "update_captions":
        if (video.userId !== session.user.id) {
          return NextResponse.json(
            { error: "Unauthorized to update captions" },
            { status: 403 }
          );
        }
        video.captions = data.captions || [];
        break;

      case "bookmark": {
        // Toggle bookmark on the Video document (store user IDs who bookmarked)
        const uid = session.user.id;
        
        // Initialize bookmarks array if it doesn't exist
        if (!video.bookmarks) {
          video.bookmarks = [];
        }
        
        const isBookmarked = video.bookmarks.includes(uid);
        console.log("Toggling bookmark for user:", uid, "isBookmarked:", isBookmarked, "current bookmarks:", video.bookmarks);
        
        if (isBookmarked) {
          video.bookmarks = video.bookmarks.filter((id: string) => id !== uid);
        } else {
          video.bookmarks.push(uid);
        }
        
        console.log("New bookmarks array:", video.bookmarks);
        
        // Explicitly mark the bookmarks field as modified for Mongoose
        video.markModified('bookmarks');
        break;
      }

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    const savedVideo = await video.save();
    console.log("Video saved successfully, bookmarks:", savedVideo.bookmarks);
    return NextResponse.json(savedVideo);
  } catch (error) {
    console.error("Error updating video:", error);
    return NextResponse.json(
      { error: "Failed to update video" },
      { status: 500 }
    );
  }
}