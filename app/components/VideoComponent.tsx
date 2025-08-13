import { useRef, useState, useEffect } from "react";
import { IVideo } from "@/models/Video";
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
} from "lucide-react";

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT!;

interface VideoComponentProps {
  video: IVideo;
  onVideoUpdate?: (updatedVideo: IVideo) => void;
}

export default function VideoComponent({ video, onVideoUpdate }: VideoComponentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [localVideo, setLocalVideo] = useState(video);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  
  const { data: session } = useSession();
  const { showNotification } = useNotification();

  const isLiked = session?.user ? localVideo.likes.includes(session.user.id) : false;

  useEffect(() => {
    setLocalVideo(video);
  }, [video]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleLike = async () => {
    if (!session?.user || isLiking) return;
    
    setIsLiking(true);
    try {
      const updatedVideo = await apiClient.likeVideo(localVideo._id!.toString());
      setLocalVideo(updatedVideo);
      onVideoUpdate?.(updatedVideo);
      
      showNotification(
        isLiked ? "Removed from likes" : "Added to likes",
        "success"
      );
    } catch (error) {
      showNotification("Failed to update like", "error");
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user || !newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const updatedVideo = await apiClient.commentOnVideo(
        localVideo._id!.toString(),
        newComment.trim()
      );
      setLocalVideo(updatedVideo);
      onVideoUpdate?.(updatedVideo);
      setNewComment("");
      showNotification("Comment added", "success");
    } catch (error) {
      showNotification("Failed to add comment", "error");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };
  return (
    <div className="flex justify-center items-center bg-black relative">
      <div className="relative w-[360px] h-[640px] sm:w-[400px] sm:h-[711px] rounded-xl overflow-hidden shadow-xl">
        {/* Video */}
        <Video
          urlEndpoint={urlEndpoint}
          ref={videoRef}
          src={localVideo.videoUrl}
          className="w-full h-full object-cover cursor-pointer"
          onClick={togglePlay}
          muted
          playsInline
          preload="metadata"
          loop
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
            <Play className="w-16 h-16 text-white opacity-80" />
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
        <Link
          href={`/video/${localVideo._id}`}
          className="absolute top-3 left-3 bg-black/50 px-2 py-1 rounded-full text-white text-xs hover:bg-black/70 z-10"
        >
          View
        </Link>

        {/* Overlay Info */}
        <div className="absolute bottom-0 left-0 w-full p-4 text-white bg-gradient-to-t from-black/60 via-black/20 to-transparent">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-3">
              <User className="text-white w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">@{localVideo.userEmail.split('@')[0]}</p>
              <p className="text-xs text-gray-300">
                {formatTimeAgo(localVideo.createdAt || new Date())}
              </p>
            </div>
          </div>

          <h3 className="text-base font-bold mb-1">{localVideo.title}</h3>
          <p className="text-sm text-gray-200 mb-4">{localVideo.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <button
                onClick={handleLike}
                disabled={!session?.user || isLiking}
                className={`flex items-center space-x-1 transition-colors ${
                  isLiked ? "text-red-500" : "text-gray-300"
                } ${!session?.user ? "opacity-50 cursor-not-allowed" : "hover:text-red-400"}`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""} ${isLiking ? "animate-pulse" : ""}`} />
                <span className="text-sm">{localVideo.likes.length}</span>
              </button>

              <button 
                onClick={() => setShowComments(!showComments)}
                className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{localVideo.comments.length}</span>
              </button>

              <button className="flex items-center space-x-1 text-gray-300">
                <Share className="w-5 h-5" />
                <span className="text-sm hidden sm:inline">Share</span>
              </button>
            </div>

            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={isBookmarked ? "text-yellow-400" : "text-gray-300"}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-20 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold">Comments ({localVideo.comments.length})</h3>
              <button
                onClick={() => setShowComments(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {localVideo.comments.map((comment, index) => (
                <div key={index} className="flex space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <User className="text-white w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-white text-sm font-semibold">
                        @{comment.userEmail.split('@')[0]}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {formatTimeAgo(comment.createdAt || new Date())}
                      </span>
                    </div>
                    <p className="text-gray-200 text-sm">{comment.text}</p>
                  </div>
                </div>
              ))}
              
              {localVideo.comments.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No comments yet</p>
                  <p className="text-sm">Be the first to comment!</p>
                </div>
              )}
            </div>
            
            {session?.user && (
              <form onSubmit={handleComment} className="p-4 border-t border-gray-700">
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
                      className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      maxLength={500}
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim() || isSubmittingComment}
                      className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors"
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
        )}
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.000`;
}