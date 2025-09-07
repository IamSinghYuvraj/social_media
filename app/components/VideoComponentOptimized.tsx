"use client";

import { useRef, useState, useEffect, useCallback, memo, type ReactNode } from "react";
import { IVideo, IComment } from "@/models/Video";
import Image from "next/image";
import Link from "next/link";
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
  Mail,
  Facebook,
  Twitter,
  Copy as CopyIcon,
} from "lucide-react";

interface VideoComponentProps {
  video: IVideo;
  onVideoUpdate?: (updatedVideo: IVideo) => void;
  isActive?: boolean;
  isNext?: boolean;
  isPrevious?: boolean;
}

const VideoComponent = memo(function VideoComponent({ 
  video, 
  onVideoUpdate = () => {}, 
  isActive = false,
  isNext = false,
  isPrevious = false,
}: VideoComponentProps) {
  const [isLoading, setIsLoading] = useState(true);
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
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentCaption] = useState<string>('');
  const [showShare, setShowShare] = useState(false);

  const { data: session } = useSession();
  const { showNotification } = useNotification();

  const isLiked = session?.user && localVideo.likes 
    ? localVideo.likes.includes(session.user.id) 
    : false;

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

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const videoData = await apiClient.getVideo(localVideo._id!.toString());
        if (!isMounted) return;
        const userId = session?.user?.id;
        const isBookmarkedByUser = !!(userId && (videoData.bookmarks || []).includes(userId));
        setIsBookmarked(isBookmarkedByUser);
      } catch {
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

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (isActive) {
      el.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      el.pause();
      setIsPlaying(false);
      if (!isNext && !isPrevious) {
        el.currentTime = 0;
      }
    }
  }, [isActive, isNext, isPrevious]);

  const handleLike = useCallback(async () => {
    if (!session?.user) {
      showNotification('Please sign in to like videos', 'error');
      return;
    }
    
    if (isLiking) return;
    
    setIsLiking(true);
    setShowLikeAnimation(true);
    
    try {
      const wasLiked = isLiked;
      const newLikes = wasLiked 
        ? localVideo.likes.filter(id => id !== session.user.id)
        : [...localVideo.likes, session.user.id];
      
      const optimisticVideo = { ...localVideo, likes: newLikes };
      setLocalVideo(optimisticVideo);
      if (onVideoUpdate) onVideoUpdate(optimisticVideo);
      
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
      if (onVideoUpdate) onVideoUpdate(safeUpdatedVideo);
      
      showNotification(
        wasLiked ? "Removed from likes" : "Added to likes",
        "success"
      );
    } catch {
      setLocalVideo(localVideo);
      if (onVideoUpdate) onVideoUpdate(localVideo);
      showNotification("Failed to update like", "error");
    } finally {
      setIsLiking(false);
    }
  }, [session?.user, isLiking, isLiked, localVideo, onVideoUpdate, showNotification]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(error => {
          console.error('Error playing video:', error);
          showNotification('Failed to play video', 'error');
        });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [showNotification]);

  const handleOpenShare = useCallback(() => {
    const url = (typeof window !== 'undefined' ? (localVideo.videoUrl || window.location.href) : localVideo.videoUrl) || '';
    const title = localVideo.caption || 'Check out this video';
    if (navigator.share && url) {
      navigator.share({ title, url }).catch(() => setShowShare(true));
      return;
    }
    setShowShare(true);
  }, [localVideo.videoUrl, localVideo.caption]);

  const handleBookmark = useCallback(async () => {
    if (!session?.user) {
      showNotification('Please sign in to bookmark videos', 'error');
      return;
    }

    try {
      try {
        const response = await fetch(`/api/videos/${localVideo._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'bookmark' }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update bookmark');
        }
        setIsBookmarked(!isBookmarked);
        showNotification(
          isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
          "success"
        );
      } catch {
        showNotification("Failed to update bookmark", "error");
      }
    } catch {
      showNotification("Failed to update bookmark", "error");
    }
  }, [session?.user, isBookmarked, localVideo._id, showNotification]);

  // Share helpers
  const getShareableUrl = useCallback((url?: string) => {
    if (!url) {
      if (typeof window !== 'undefined') return window.location.href;
      return '';
    }
    if (/^https?:\/\//i.test(url)) return url;
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      return url.startsWith('/') ? `${origin}${url}` : `${origin}/${url}`;
    }
    return url;
  }, []);

  const openUrl = useCallback((url: string) => {
    if (!url) return;
    window.open(url, '_blank');
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showNotification('Link copied to clipboard', 'success');
    } catch {
      showNotification('Failed to copy link', 'error');
    }
  }, [showNotification]);

  // Small share item component for the modal grid
  const ShareItem = ({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) => (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition"
    >
      <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow">
        {children}
      </div>
      <span className="text-xs">{label}</span>
    </button>
  );

  const handleCommentSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      showNotification('Please sign in to comment', 'error');
      return;
    }
    
    if (!newComment.trim() || isSubmittingComment) {
      return;
    }
    
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
      if (onVideoUpdate) onVideoUpdate(safeUpdatedVideo);
      setNewComment("");
      showNotification("Comment added", "success");
    } catch {
      showNotification("Failed to add comment", "error");
    } finally {
      setIsSubmittingComment(false);
    }
  }, [session?.user, newComment, isSubmittingComment, localVideo, onVideoUpdate, showNotification]);

  const renderComments = (comments: IComment[]) => {
    return comments.map((comment) => (
      <div key={safeId(comment)} className="flex space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
        <Link href={`/user/${comment.userId}`} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
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
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <Link href={`/user/${comment.userId}`} className="font-medium text-gray-900 dark:text-white text-sm hover:underline">
              {getUsernameFromEmail(comment.userEmail)}
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatTimeAgo(comment.createdAt)}
            </p>
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed break-words">
            {comment.text}
          </p>
        </div>
      </div>
    ));
  };

  // displayName is optional; omitted to avoid type friction during build

  if (!localVideo.videoUrl) {
    return (
      <div className="flex justify-center items-center bg-black relative h-[100dvh]">
        <div className="relative aspect-[9/16] h-full max-h-[100dvh] w-full max-w-[min(100vw,calc(100dvh*9/16))] sm:max-w-[420px] md:max-w-[480px] rounded-none md:rounded-2xl overflow-hidden shadow-xl bg-gray-800 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8" />
            </div>
            <p>Video not available</p>

            <p className="text-sm mb-3 line-clamp-2">{localVideo.caption}</p>

            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <button
                  onClick={handleLike}
                  disabled={!session?.user || isLiking}
                  className={`flex flex-col items-center group transition-all duration-300 ${
                    isLiked ? "text-red-500" : "text-gray-300"
                  } ${!session?.user ? "opacity-50 cursor-not-allowed" : "hover:text-red-400 hover:scale-110 active:scale-95"}`}
                >
                  <Heart className={`w-5 h-5 transition-all duration-300 ${isLiked ? "fill-current animate-heart-beat" : ""} ${isLiking ? "animate-pulse" : ""}`} />
                  <span className="text-sm">{localVideo.likes?.length || 0}</span>
                </button>

                <button
                  onClick={() => setShowComments(true)}
                  className="flex flex-col items-center group text-gray-300 hover:text-white transition-all duration-300 hover:scale-110 active:scale-95"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{localVideo.comments?.length || 0}</span>
                </button>

                <button
                  onClick={handleOpenShare}
                  className="flex flex-col items-center group text-gray-300 hover:text-white transition-all duration-300 hover:scale-110 active:scale-95"
                >
                  <Share className="w-5 h-5" />
                  <span className="text-sm hidden sm:inline">Share</span>
                </button>
              </div>

              <button
                onClick={handleBookmark}
                disabled={!session?.user}
                className={`transition-all duration-300 hover:scale-110 active:scale-95 ${isBookmarked ? "text-yellow-400" : "text-gray-300 hover:text-yellow-400"} ${!session?.user ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>
          </div>
        {showComments && (
          <div className="fixed inset-0 z-30 flex items-start justify-end">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowComments(false)}
            />
            
            <div className="relative z-10 w-full max-w-md h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col">
              <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
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
              
              {session?.user && (
                <form onSubmit={handleCommentSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {session.user.image ? (
                        <Image 
                          src={session.user.image} 
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
  }

  return (
    <div className="relative h-[100dvh] w-full bg-black flex items-center justify-center">
      <div className="relative aspect-[9/16] h-full max-h-[100dvh] w-full max-w-[min(100vw,calc(100dvh*9/16))] sm:max-w-[420px] md:max-w-[480px] overflow-hidden rounded-none md:rounded-2xl">
      {/* Video element */}
      <video
        ref={videoRef}
        src={localVideo.videoUrl}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        playsInline
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedData={() => setIsLoading(false)}
        preload={isActive || isNext || isPrevious ? "auto" : "metadata"}
        onError={(e) => {
          console.error('Video error:', e);
          showNotification('Failed to load video', 'error');
          setIsLoading(false);
        }}
      >
        <track kind="captions" />
      </video>

      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="w-20 h-20 bg-black/30 rounded-full flex items-center justify-center backdrop-blur-sm"
          >
            <Play className="w-10 h-10 text-white ml-1" fill="currentColor" />
          </button>
        </div>
      )}

      {currentCaption && (
        <div className="absolute bottom-20 left-4 right-4">
          <div className="bg-black/70 text-white px-3 py-2 rounded-lg text-center backdrop-blur-sm">
            <p className="text-sm leading-relaxed">{currentCaption}</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-end">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <Link href={`/user/${localVideo.userId}`} className="flex items-center space-x-2 group/profile">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                  {localVideo.userProfilePicture ? (
                    <Image src={localVideo.userProfilePicture} alt="profile" width={32} height={32} className="w-full h-full object-cover" unoptimized />
                  ) : (
                    <User className="text-white w-4 h-4" />
                  )}
                </div>
                <span className="text-white font-medium text-sm hover:underline">
                  @{getUsernameFromEmail(localVideo.userEmail)}
                </span>
              </Link>
              <span className="text-gray-300 text-xs">
                {formatTimeAgo(localVideo.createdAt)}
              </span>
            </div>

            <p className="text-white text-sm mb-2 line-clamp-2">{localVideo.caption}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-5">
                <button
                  onClick={handleLike}
                  disabled={!session?.user || isLiking}
                  className={`flex items-center space-x-1 group transition-all duration-300 ${
                    isLiked ? "text-red-500" : "text-gray-300"
                  } ${!session?.user ? "opacity-50 cursor-not-allowed" : "hover:text-red-400 hover:scale-110 active:scale-95"}`}
                >
                  <Heart className={`w-6 h-6 transition-all duration-300 ${isLiked ? "fill-current animate-pulse" : ""} ${isLiking ? "animate-pulse" : ""}`} />
                  <span className="text-xs">{localVideo.likes?.length || 0}</span>
                </button>

                <button
                  onClick={() => setShowComments(true)}
                  className="flex items-center space-x-1 group text-gray-300 hover:text-white transition-all duration-300 hover:scale-110 active:scale-95"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span className="text-xs">{localVideo.comments?.length || 0}</span>
                </button>

                <button
                onClick={handleOpenShare}
                className="flex items-center space-x-1 group text-gray-300 hover:text-white transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <Share className="w-6 h-6" />
                <span className="text-xs">Share</span>
              </button>
              </div>

              <button
                onClick={handleBookmark}
                disabled={!session?.user}
                className={`flex items-center group transition-all duration-300 hover:scale-110 active:scale-95 ${isBookmarked ? "text-yellow-400" : "text-gray-300 hover:text-yellow-400"} ${!session?.user ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Bookmark className={`w-6 h-6 ${isBookmarked ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showComments && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowComments(false)}
          />
          
          <div className="relative z-10 w-full max-w-md h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col">
            <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
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
            
            {session?.user && (
              <form onSubmit={handleCommentSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {session.user.image ? (
                      <Image 
                        src={session.user.image} 
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

      {showLikeAnimation && (
        <div 
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          onAnimationEnd={() => setShowLikeAnimation(false)}
        >
          <Heart className="w-20 h-20 text-red-500 fill-current animate-bounce" />
        </div>
      )}

      {showShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowShare(false)} />
          <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <h4 className="text-gray-900 dark:text-white font-semibold">Share</h4>
              <button onClick={() => setShowShare(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-5 gap-4 mb-4">
                <ShareItem label="WhatsApp" onClick={() => openUrl(`https://wa.me/?text=${encodeURIComponent(getShareableUrl(localVideo.videoUrl))}`)}>
                  {/* Simple WhatsApp logo */}
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M20.52 3.48A11.94 11.94 0 0 0 12.06 0C5.5 0 .2 5.3.2 11.86c0 2.09.55 4.08 1.6 5.87L0 24l6.43-1.68a11.87 11.87 0 0 0 5.63 1.43h.01c6.56 0 11.86-5.3 11.86-11.86 0-3.18-1.24-6.16-3.41-8.41Zm-8.46 18.2h-.01a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.82 1 1.02-3.72-.24-.38a9.9 9.9 0 0 1-1.54-5.33c0-5.47 4.45-9.92 9.92-9.92 2.65 0 5.14 1.03 7.01 2.9a9.84 9.84 0 0 1 2.91 7.01c0 5.47-4.45 9.92-9.92 9.92Zm5.66-7.42c-.31-.16-1.83-.9-2.12-1.01-.29-.12-.5-.16-.72.16-.21.31-.82 1.01-1 1.22-.18.2-.37.23-.68.08-.31-.16-1.31-.48-2.49-1.54-.92-.82-1.54-1.83-1.72-2.14-.18-.31-.02-.48.14-.63.14-.14.31-.37.47-.56.16-.19.21-.31.31-.52.1-.2.06-.39-.03-.55-.08-.16-.72-1.72-.98-2.36-.26-.63-.52-.54-.72-.55h-.62c-.2 0-.55.08-.84.39-.29.31-1.11 1.08-1.11 2.63 0 1.54 1.14 3.03 1.3 3.23.16.2 2.23 3.4 5.4 4.77.76.33 1.36.52 1.82.67.76.24 1.46.21 2.01.13.61-.09 1.83-.75 2.09-1.47.26-.72.26-1.34.18-1.47-.08-.13-.28-.21-.59-.37Z"/></svg>
                </ShareItem>
                <ShareItem label="X" onClick={() => openUrl(`https://x.com/intent/tweet?url=${encodeURIComponent(getShareableUrl(localVideo.videoUrl))}`)}>
                  <Twitter className="w-6 h-6" />
                </ShareItem>
                <ShareItem label="Facebook" onClick={() => openUrl(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareableUrl(localVideo.videoUrl))}`)}>
                  <Facebook className="w-6 h-6" />
                </ShareItem>
                <ShareItem label="Email" onClick={() => openUrl(`mailto:?subject=${encodeURIComponent('Check this video')}&body=${encodeURIComponent(getShareableUrl(localVideo.videoUrl))}`)}>
                  <Mail className="w-6 h-6" />
                </ShareItem>
                <ShareItem label="Copy" onClick={() => copyToClipboard(getShareableUrl(localVideo.videoUrl))}>
                  <CopyIcon className="w-6 h-6" />
                </ShareItem>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                <input
                  readOnly
                  value={getShareableUrl(localVideo.videoUrl)}
                  className="w-full bg-transparent text-sm text-gray-800 dark:text-gray-200 outline-none"
                />
                <button
                  onClick={() => copyToClipboard(getShareableUrl(localVideo.videoUrl))}
                  className="px-3 py-1 text-sm rounded-md bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
});

export default VideoComponent;