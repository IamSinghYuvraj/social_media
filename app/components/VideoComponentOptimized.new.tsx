import { useRef, useState, useEffect, useCallback, memo } from "react";
import { IVideo, IComment, ICaption } from "@/models/Video";
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
  const [currentCaption, setCurrentCaption] = useState('');
  const [currentUserProfilePicture, setCurrentUserProfilePicture] = useState<string | null>(null);
  
  const captions: ICaption[] = (localVideo as IVideo).captions || [];
  const { data: session } = useSession();
  const { showNotification } = useNotification();
  const isLiked = session?.user && localVideo.likes ? localVideo.likes.includes(session.user.id) : false;

  // ... [rest of the component code remains the same until the return statement]

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
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <button 
                onClick={handleLike}
                disabled={isLiking}
                className="flex flex-col items-center group"
              >
                <div className="p-2 rounded-full group-hover:bg-white/10 transition-colors">
                  <Heart 
                    className={`w-6 h-6 ${isLiked ? 'text-red-500 fill-current' : 'text-white'}`} 
                  />
                </div>
                <span className="text-xs mt-1">{localVideo.likes?.length || 0}</span>
              </button>
              
              <button 
                onClick={() => setShowComments(true)}
                className="flex flex-col items-center group"
              >
                <div className="p-2 rounded-full group-hover:bg-white/10 transition-colors">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs mt-1">{localVideo.comments?.length || 0}</span>
              </button>
              
              <button className="flex flex-col items-center group">
                <div className="p-2 rounded-full group-hover:bg-white/10 transition-colors">
                  <Share className="w-6 h-6 text-white" />
                </div>
              </button>
            </div>
            
            <button 
              onClick={handleBookmark}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <Bookmark 
                className={`w-6 h-6 ${isBookmarked ? 'text-yellow-400 fill-current' : 'text-white'}`} 
              />
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
          <div className="relative z-10 w-full max-w-md h-full bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto">
            <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Comments</h2>
              <button 
                onClick={() => setShowComments(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {localVideo.comments && localVideo.comments.length > 0 ? (
                renderComments(localVideo.comments)
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No comments yet. Be the first to comment!
                </p>
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
