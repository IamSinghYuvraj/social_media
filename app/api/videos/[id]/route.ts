import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Video from "@/models/Video";
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

        video.comments.push({
          userId: session.user.id,
          userEmail: session.user.email,
          text: text.trim(),
        });
        break;

      case "reply": {
        const { parentCommentId, text: replyText } = data as { parentCommentId?: string; text?: string };
        if (!parentCommentId || !replyText || replyText.trim().length === 0) {
          return NextResponse.json(
            { error: "parentCommentId and reply text are required" },
            { status: 400 }
          );
        }

        // Find the parent comment and add reply
        let commentFound = false;
        for (const comment of video.comments) {
          if (comment._id && comment._id.toString() === parentCommentId) {
            if (!comment.replies) {
              comment.replies = [];
            }
            comment.replies.push({
              userId: session.user.id,
              userEmail: session.user.email,
              text: replyText.trim(),
            });
            commentFound = true;
            break;
          }
        }

        if (!commentFound) {
          return NextResponse.json(
            { error: "Parent comment not found" },
            { status: 404 }
          );
        }
        break;
      }

      case "update_captions":
        if (video.userId !== session.user.id) {
          return NextResponse.json(
            { error: "Unauthorized to update captions" },
            { status: 403 }
          );
        }
        video.captions = data.captions || [];
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    await video.save();
    return NextResponse.json(video);
  } catch (error) {
    console.error("Error updating video:", error);
    return NextResponse.json(
      { error: "Failed to update video" },
      { status: 500 }
    );
  }
}