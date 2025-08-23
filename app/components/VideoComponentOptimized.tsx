import { useRef, useState, useEffect, useCallback, memo, useMemo } from "react";
import { IVideo, IComment } from "@/models/Video";
import { Video } from "@imagekit/next";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/api-client";
import { useNotification } from "./Notification";
import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  User,
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
  onVideoUpdate = () => {}, 
  isActive = false 
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
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const captions = useMemo(() => (localVideo as IVideo).captions || [], [localVideo]);
  
  const { data: session } = useSession();
  const { showNotification } = useNotification();
  const [currentUserProfilePicture, setCurrentUserProfilePicture] = useState<string | null>(null);

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

  // Track current caption text
  const [currentCaption, setCurrentCaption] = useState<string>('');

  // Update current caption based on video time
  useEffect(() => {
    if (!captions?.length || !videoRef.current) return;

    const updateCaption = () => {
      const currentTime = videoRef.current?.currentTime || 0;
      
      // Find the first caption that should be displayed at the current time
      const activeCaption = captions.find(caption => 
        currentTime >= caption.startTime && currentTime <= caption.endTime
      );

      setCurrentCaption(activeCaption?.text || '');
    };

    // Set up time update listener
    const video = videoRef.current;
    video.addEventListener('timeupdate', updateCaption);
    
    // Initial update
    updateCaption();

    return () => {
      video.removeEventListener('timeupdate', updateCaption);
    };
  }, [captions]);

  // Fetch current user's profile picture for comment input avatar fallback
  useEffect(() => {
    console.log('Fetching current user profile picture');
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted) setCurrentUserProfilePicture(data?.profilePicture ?? null);
      } catch {
        // no-op
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Initialize bookmark state for this video
  useEffect(() => {
    if (!session?.user || !localVideo._id) return;
    
    let isMounted = true;
    (async () => {
      try {
        // Check if current user's ID is in the video's bookmarks array
        const videoData = await apiClient.getVideo(localVideo._id!.toString());
        if (!isMounted) return;
        const isBookmarkedByUser = (videoData.bookmarks || []).includes(session.user.id);
        setIsBookmarked(isBookmarkedByUser);
        console.log("Bookmark state for video:", localVideo._id, "isBookmarked:", isBookmarkedByUser);
      } catch (error) {
        console.error("Error checking bookmark state:", error);
        // Fallback: check via bookmarked videos list
        try {
          const list = await apiClient.getBookmarkedVideos();
          if (!isMounted) return;
          const found = !!list.find(v => v._id?.toString() === localVideo._id?.toString());
          setIsBookmarked(found);
        } catch {
          // ignore
        }
      }
    })();
    return () => { isMounted = false; };
  }, [localVideo._id, session?.user]);

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


  const renderComments = useCallback((comments: IComment[]) => {
    if (!comments || comments.length === 0) return null;
    
    return comments.map((comment, index) => (
      <div key={safeId(comment) || `${comment.text}-${index}`} className="flex space-x-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {comment.userProfilePicture ? (
            <Image 
              src={comment.userProfilePicture} 
              alt={`${getUsernameFromEmail(comment.userEmail)} profile`}
              width={32}
              height={32}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <User className="text-white w-4 h-4" />
          )}
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
        </div>
      </div>
    ));
  }, [safeId, getUsernameFromEmail, formatTimeAgo]);

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
        <div className="relative w-full h-full">
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
          />
          
          {/* Caption Overlay */}
          {currentCaption && (
            <div className="absolute bottom-16 left-0 right-0 px-4 py-2 text-center">
              <div className="inline-block bg-black/70 text-white text-sm sm:text-base px-4 py-2 rounded-lg max-w-[90%] mx-auto">
                {currentCaption}
              </div>
            </div>
          )}
        </div>

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

        {/* Removed 'More Options' and 'View' link as requested */}

        {/* Overlay Info */}
        {/* Overlay Info */}
        <div className="absolute bottom-0 left-0 w-full p-4 text-white bg-gradient-to-t from-black/60 via-black/20 to-transparent">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-3 overflow-hidden">
              {localVideo.userProfilePicture ? (
                <Image 
                  src={localVideo.userProfilePicture} 
                  alt={`${getUsernameFromEmail(localVideo.userEmail)} profile`}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <User className="text-white w-4 h-4" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold">@{getUsernameFromEmail(localVideo.userEmail)}</p>
              <p className="text-xs text-gray-300">{formatTimeAgo(localVideo.createdAt)}</p>
            </div>
          </div>
          
          {/* Video Caption */}
          <p className="text-sm mb-3 line-clamp-2">{localVideo.caption}</p>

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
                onClick={() => setShowComments(true)}
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
              onClick={async () => {
                if (!session?.user) return;
                const next = !isBookmarked;
                setIsBookmarked(next);
                console.log("Toggling bookmark, new state:", next, "for video:", localVideo._id);
                try {
                  const updatedVideo = await apiClient.toggleBookmark(localVideo._id!.toString());
                  console.log("Bookmark toggle response:", updatedVideo);
                  // Update local video state with the response
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
                  showNotification(next ? "Added to bookmarks" : "Removed from bookmarks", "success");
                } catch (error) {
                  console.error("Bookmark toggle failed:", error);
                  setIsBookmarked(!next);
                  showNotification("Failed to update bookmark", "error");
                }
              }}
              className={`transition-all duration-300 hover:scale-110 active:scale-95 ${isBookmarked ? "text-yellow-400" : "text-gray-300 hover:text-yellow-400"}`}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Comments Drawer */}
      {showComments && (
        <div className="fixed inset-0 z-30 flex items-start justify-end">
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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {session.user.image || currentUserProfilePicture ? (
                      <Image 
                        src={(session.user.image || currentUserProfilePicture) as string} 
                        alt={`${session.user.name || session.user.email} profile`}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <User className="text-white w-4 h-4" />
                    )}
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

VideoComponent.displayName = 'VideoComponent';

export default VideoComponent;
