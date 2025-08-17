import { useRef, useState, useEffect, useCallback, memo } from "react";
import { IVideo, IComment } from "@/models/Video";
import { Video } from "@imagekit/next";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/api-client";
import { useNotification } from "./Notification";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  User,
  MoreHorizontal,
  Play,
  Send,
  X,
} from "lucide-react";

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT!;

interface VideoComponentProps {
  video: IVideo;
  onVideoUpdate?: (updatedVideo: IVideo) => void;
  isActive?: boolean;
}

const VideoComponent = memo(function VideoComponent({ 
  video, 
  onVideoUpdate, 
  isActive 
}: VideoComponentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [localVideo, setLocalVideo] = useState(() => ({
    ...video,
    likes: video.likes || [],
    comments: video.comments || [],
    userEmail: video.userEmail || 'user@example.com',
    caption: video.caption || 'No caption available',
    createdAt: video.createdAt || new Date()
  }));
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [replyForCommentId, setReplyForCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  
  const { data: session } = useSession();
  const { showNotification } = useNotification();

  const isLiked = session?.user && localVideo.likes 
    ? localVideo.likes.includes(session.user.id) 
    : false;

  // Memoized functions to prevent unnecessary re-renders
  const getUsernameFromEmail = useCallback((email: string | undefined) => {
    if (!email || typeof email !== 'string') return 'Unknown';
    try {
      return email.split('@')[0] || 'Unknown';
    } catch {
      return 'Unknown';
    }
  }, []);

  const formatTimeAgo = useCallback((date: Date | string | undefined) => {
    if (!date) return 'now';
    
    const now = new Date();
    const targetDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${Math.max(0, diffInSeconds)}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  }, []);

  const safeId = useCallback((c: { _id?: unknown }): string => {
    const v = c._id as undefined | string | { toString?: () => string };
    if (!v) return '';
    return typeof v === 'string' ? v : v.toString?.() ?? '';
  }, []);

  useEffect(() => {
    setLocalVideo({
      ...video,
      likes: video.likes || [],
      comments: video.comments || [],
      userEmail: video.userEmail || 'user@example.com',
      caption: video.caption || 'No caption available',
      createdAt: video.createdAt || new Date()
    });
  }, [video]);

  // Optimized video play/pause with intersection observer
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (isActive) {
      // Preload video when becoming active
      el.preload = 'metadata';
      el.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      el.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleLike = useCallback(async () => {
    if (!session?.user || isLiking) return;
    
    // Optimistic update
    const wasLiked = isLiked;
    const newLikes = wasLiked 
      ? localVideo.likes.filter(id => id !== session.user.id)
      : [...localVideo.likes, session.user.id];
    
    const optimisticVideo = { ...localVideo, likes: newLikes };
    setLocalVideo(optimisticVideo);
    onVideoUpdate?.(optimisticVideo);
    
    // Trigger like animation
    if (!wasLiked) {
      setShowLikeAnimation(true);
      setTimeout(() => setShowLikeAnimation(false), 1000);
    }
    
    setIsLiking(true);
    try {
      const updatedVideo = await apiClient.likeVideo(localVideo._id!.toString());
      const safeUpdatedVideo = {
        ...updatedVideo,
        likes: updatedVideo.likes || [],
        comments: updatedVideo.comments || localVideo.comments,
        userEmail: updatedVideo.userEmail || localVideo.userEmail,
        caption: updatedVideo.caption || localVideo.caption,
        createdAt: updatedVideo.createdAt || localVideo.createdAt
      };
      setLocalVideo(safeUpdatedVideo);
      onVideoUpdate?.(safeUpdatedVideo);
      
      showNotification(
        wasLiked ? "Removed from likes" : "Added to likes",
        "success"
      );
    } catch {
      // Revert optimistic update on error
      setLocalVideo(localVideo);
      onVideoUpdate?.(localVideo);
      showNotification("Failed to update like", "error");
    } finally {
      setIsLiking(false);
    }
  }, [session?.user, isLiking, isLiked, localVideo, onVideoUpdate, showNotification]);

  const handleComment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user || !newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const updatedVideo = await apiClient.commentOnVideo(
        localVideo._id!.toString(),
        newComment.trim()
      );
      const safeUpdatedVideo = {
        ...updatedVideo,
        likes: updatedVideo.likes || localVideo.likes,
        comments: updatedVideo.comments || [],
        userEmail: updatedVideo.userEmail || localVideo.userEmail,
        caption: updatedVideo.caption || localVideo.caption,
        createdAt: updatedVideo.createdAt || localVideo.createdAt
      };
      setLocalVideo(safeUpdatedVideo);
      onVideoUpdate?.(safeUpdatedVideo);
      setNewComment("");
      showNotification("Comment added", "success");
    } catch {
      showNotification("Failed to add comment", "error");
    } finally {
      setIsSubmittingComment(false);
    }
  }, [session?.user, newComment, isSubmittingComment, localVideo, onVideoUpdate, showNotification]);

  const handleReplySubmit = useCallback(async (parentId: string) => {
    if (!session?.user || !replyText.trim() || isSubmittingReply) return;
    
    setIsSubmittingReply(true);
    try {
      const updatedVideo = await apiClient.replyToComment(
        localVideo._id!.toString(),
        parentId,
        replyText.trim()
      );
      
      const safeUpdatedVideo = {
        ...updatedVideo,
        likes: updatedVideo.likes || localVideo.likes,
        comments: updatedVideo.comments || localVideo.comments,
        userEmail: updatedVideo.userEmail || localVideo.userEmail,
        caption: updatedVideo.caption || localVideo.caption,
        createdAt: updatedVideo.createdAt || localVideo.createdAt
      };
      
      setLocalVideo(safeUpdatedVideo);
      onVideoUpdate?.(safeUpdatedVideo);
      setReplyText("");
      setReplyForCommentId(null);
      showNotification("Reply added", "success");
    } catch (error) {
      console.error('Reply submission error:', error);
      showNotification("Failed to add reply", "error");
    } finally {
      setIsSubmittingReply(false);
    }
  }, [session?.user, replyText, isSubmittingReply, localVideo, onVideoUpdate, showNotification]);

  const renderComments = useCallback((comments: IComment[], level = 0) => {
    if (!comments || comments.length === 0) return null;
    
    return comments.map((comment, index) => (
      <div key={safeId(comment) || `${comment.text}-${level}-${index}`} className={`flex space-x-3 ${level > 0 ? 'ml-6 pl-4 border-l-2 border-gray-200 dark:border-gray-700' : ''}`}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
          <User className="text-white w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-gray-900 dark:text-white text-sm font-semibold">
              @{getUsernameFromEmail(comment.userEmail)}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-xs">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.text || 'No comment text'}</p>
          {session?.user && (
            <button
              onClick={() => setReplyForCommentId(safeId(comment))}
              className="text-xs text-gray-500 hover:text-gray-300 mt-1"
            >
              Reply
            </button>
          )}

          {replyForCommentId === safeId(comment) && (
            <div className="mt-2 flex space-x-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-200 dark:border-gray-700"
                maxLength={300}
              />
              <button
                onClick={() => handleReplySubmit(safeId(comment))}
                disabled={!replyText.trim() || isSubmittingReply}
                className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors text-sm"
              >
                {isSubmittingReply ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Send'
                )}
              </button>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </div>
              {renderComments(comment.replies, level + 1)}
            </div>
          )}
        </div>
      </div>
    ));
  }, [safeId, getUsernameFromEmail, formatTimeAgo, session?.user, replyForCommentId, replyText, isSubmittingReply, handleReplySubmit]);

  // Don't render if essential video data is missing
  if (!localVideo.videoUrl) {
    return (
      <div className="flex justify-center items-center bg-black relative">
        <div className="relative w-[360px] h-[640px] sm:w-[400px] sm:h-[711px] rounded-xl overflow-hidden shadow-xl bg-gray-800 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8" />
            </div>
            <p>Video not available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center bg-black relative">
      {/* Main Video Container */}
      <div className="relative w-[360px] h-[640px] sm:w-[400px] sm:h-[711px] rounded-xl overflow-hidden shadow-xl">
        {/* Video with lazy loading */}
        <Video
          urlEndpoint={urlEndpoint}
          ref={videoRef}
          src={localVideo.videoUrl}
          className="w-full h-full object-cover cursor-pointer"
          onClick={togglePlay}
          muted
          playsInline
          preload={isActive ? "metadata" : "none"}
          loop
          loading="lazy"
        >
          {/* Captions */}
          {localVideo.captions && localVideo.captions.length > 0 && (
            <track
              kind="captions"
              src={`data:text/vtt;base64,${btoa(
                `WEBVTT\n\n${localVideo.captions
                  .map(
                    (caption, index) =>
                      `${index + 1}\n${formatTime(caption.startTime)} --> ${formatTime(
                        caption.endTime
                      )}\n${caption.text}\n`
                  )
                  .join('\n')}`
              )}`}
              srcLang="en"
              label="English"
              default
            />
          )}
        </Video>

        {/* Play Button */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 bg-black/30 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          </div>
        )}

        {/* Like Animation */}
        {showLikeAnimation && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="like-animation">
              <Heart className="w-20 h-20 text-red-500 fill-current drop-shadow-lg" />
            </div>
          </div>
        )}

        {/* More Options */}
        <button
          className="absolute top-3 right-3 bg-black/50 p-1 rounded-full hover:bg-black/70 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="w-5 h-5 text-white" />
        </button>

        {/* Video Link */}
        {localVideo._id && (
          <Link
            href={`/video/${localVideo._id}`}
            className="absolute top-3 left-3 bg-black/50 px-2 py-1 rounded-full text-white text-xs hover:bg-black/70 z-10"
          >
            View
          </Link>
        )}

        {/* Overlay Info */}
        <div className="absolute bottom-0 left-0 w-full p-4 text-white bg-gradient-to-t from-black/60 via-black/20 to-transparent">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-3">
              <User className="text-white w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">@{getUsernameFromEmail(localVideo.userEmail)}</p>
              <p className="text-xs text-gray-300">
                {formatTimeAgo(localVideo.createdAt)}
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-200 mb-4">{localVideo.caption}</p>

          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <button
                onClick={handleLike}
                disabled={!session?.user || isLiking}
                className={`flex items-center space-x-1 transition-all duration-300 ${
                  isLiked ? "text-red-500" : "text-gray-300"
                } ${!session?.user ? "opacity-50 cursor-not-allowed" : "hover:text-red-400 hover:scale-110 active:scale-95"}`}
              >
                <Heart className={`w-5 h-5 transition-all duration-300 ${isLiked ? "fill-current animate-heart-beat" : ""} ${isLiking ? "animate-pulse" : ""}`} />
                <span className="text-sm">{localVideo.likes.length}</span>
              </button>

              <button 
                onClick={() => setShowComments(!showComments)}
                className="flex items-center space-x-1 text-gray-300 hover:text-white transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{localVideo.comments.length}</span>
              </button>

              <button className="flex items-center space-x-1 text-gray-300 hover:text-white transition-all duration-300 hover:scale-110 active:scale-95">
                <Share className="w-5 h-5" />
                <span className="text-sm hidden sm:inline">Share</span>
              </button>
            </div>

            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`transition-all duration-300 hover:scale-110 active:scale-95 ${isBookmarked ? "text-yellow-400" : "text-gray-300 hover:text-yellow-400"}`}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Comments Side Panel - Separate from video */}
      {showComments && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowComments(false)}
          />
          
          {/* Comments Panel */}
          <div className="relative ml-auto w-full max-w-md h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <h3 className="text-gray-900 dark:text-white font-semibold text-lg">
                Comments ({localVideo.comments.length})
              </h3>
              <button
                onClick={() => setShowComments(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
              {renderComments(localVideo.comments)}
              
              {localVideo.comments.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium mb-1">No comments yet</p>
                  <p className="text-sm">Be the first to comment!</p>
                </div>
              )}
            </div>
            
            {/* Comment Input */}
            {session?.user && (
              <form onSubmit={handleComment} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <User className="text-white w-4 h-4" />
                  </div>
                  <div className="flex-1 flex space-x-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-200 dark:border-gray-700"
                      maxLength={500}
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim() || isSubmittingComment}
                      className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl transition-colors flex items-center justify-center"
                    >
                      {isSubmittingComment ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.000`;
}

export default VideoComponent;
