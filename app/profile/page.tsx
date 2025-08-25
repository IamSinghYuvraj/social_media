"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { IVideo } from "@/models/Video";
import { apiClient } from "@/lib/api-client";

import { User, Video, Heart, MessageCircle, Calendar, Upload, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { Video as VideoPlayer } from "@imagekit/next";
import Image from "next/image";

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT!;

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [bookmarkedVideos, setBookmarkedVideos] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{
    username: string;
    profilePicture?: string;
    email: string;
  } | null>(null);
  const [userStats, setUserStats] = useState<{
    videosPosted: number;
    totalLikes: number;
    totalComments: number;
    totalViews: number;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.email) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch user profile
        const profileRes = await fetch("/api/user/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserProfile(profileData);
        }
        
        // Fetch user stats
        const stats = await apiClient.getUserStats();
        setUserStats(stats);
        
        // Fetch user videos
        const userVideos = await apiClient.getUserVideos(session.user.id);
        setVideos(userVideos);

        // Fetch bookmarked videos
        const bVideos = await apiClient.getBookmarkedVideos();
        setBookmarkedVideos(bVideos);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load your profile");
      } finally {
        setLoading(false);
      }
    };

    if (status !== "loading" && session?.user) {
      fetchUserData();
    }
  }, [session, status]);

  // Autoplay/pause videos in the grid like the videos page
  useEffect(() => {
    const container = document.getElementById("profile-videos-container");
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoEl = entry.target.querySelector("video") as HTMLVideoElement | null;
          if (!videoEl) return;
          if (entry.isIntersecting) {
            // attempt to play when 70% visible
            videoEl.play().catch(() => {});
          } else {
            videoEl.pause();
            videoEl.currentTime = 0;
          }
        });
      },
      { threshold: 0.7 }
    );

    const items = container.querySelectorAll(".profile-video-card");
    items.forEach((el) => observer.observe(el));
    return () => {
      items.forEach((el) => observer.unobserve(el));
    };
  }, [videos]);

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Delete this video? This cannot be undone.")) return;
    try {
      setDeletingId(id);
      await apiClient.deleteVideo(id);
      setVideos((prev) => prev.filter((v) => v._id?.toString() !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete video");
    } finally {
      setDeletingId(null);
    }
  };

  // Show authentication required screen
  if (status === "loading") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black z-40">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTotalLikes = () => {
    return videos.reduce((total, video) => total + video.likes.length, 0);
  };

  const getTotalComments = () => {
    return videos.reduce((total, video) => total + video.comments.length, 0);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50/80 via-pink-50/80 to-red-50/80 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 overflow-y-auto">
      <main className="py-8 px-4 sm:px-6 lg:px-8 md:ml-20 min-h-full">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-modern-lg border border-gray-200/30 dark:border-gray-800/30 p-6 sm:p-8 mb-8 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Profile Avatar */}
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center shadow-modern overflow-hidden bg-gray-200 dark:bg-gray-800">
                  {userProfile?.profilePicture ? (
                    <Image
                      src={userProfile.profilePicture}
                      alt="Profile"
                      width={128}
                      height={128}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                  )}
                </div>
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 text-crisp">
                  @{userProfile?.username || session.user.email?.split('@')[0]}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {userProfile?.email || session.user.email}
                </p>
                
                {/* Stats */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Video className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      <strong className="text-gray-900 dark:text-white">{userStats?.videosPosted || videos.length}</strong> Videos
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      <strong className="text-gray-900 dark:text-white">{userStats?.totalLikes || getTotalLikes()}</strong> Likes
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      <strong className="text-gray-900 dark:text-white">{userStats?.totalComments || getTotalComments()}</strong> Comments
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Upload Button */}
              <Link
                href="/upload"
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-modern"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Video</span>
              </Link>
            </div>
          </div>

          {/* Videos Section */}
          <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-modern-lg border border-gray-200/30 dark:border-gray-800/30 p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 text-crisp">
              Your Videos
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                  <p className="text-gray-600 dark:text-gray-300">Loading your videos...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Failed to load videos
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                  No videos yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                  Start creating and sharing your amazing content with the world!
                </p>
                
                <Link
                  href="/upload"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-modern"
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload Your First Video</span>
                </Link>
              </div>
            ) : (
              <div id="profile-videos-container" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {videos.map((video) => (
                  <Link
                    key={video._id?.toString()}
                    href={`/clips/${video._id}`}
                    className="profile-video-card group relative bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-modern hover:shadow-modern-lg transition-all duration-300 hover:scale-[1.02] block"
                  >
                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(video._id?.toString()); }}
                      className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm"
                      title="Delete video"
                      disabled={deletingId === video._id?.toString()}
                    >
                      {deletingId === video._id?.toString() ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                    {/* Video Thumbnail */}
                    <div className="aspect-[9/16] relative overflow-hidden">
                      <VideoPlayer
                        urlEndpoint={urlEndpoint}
                        src={video.videoUrl}
                        alt={video.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        controls={false}
                        muted
                        loop
                        autoPlay
                        playsInline
                        preload="metadata"
                        poster={video.thumbnailUrl}
                      />
                      
                      {/* Play Overlay */}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Video Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 text-sm">
                        {video.caption}
                      </h3>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Heart className="w-3 h-3" />
                            <span>{video.likes.length}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{video.comments.length}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(video.createdAt || new Date())}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Bookmarked Videos Section */}
          <div className="mt-8 bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-modern-lg border border-gray-200/30 dark:border-gray-800/30 p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 text-crisp">
              Bookmarked Videos
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                  <p className="text-gray-600 dark:text-gray-300">Loading bookmarked videos...</p>
                </div>
              </div>
            ) : bookmarkedVideos.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2a2 2 0 00-2 2v18l8-5 8 5V4a2 2 0 00-2-2H6z"/></svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No bookmarks yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300">Bookmark videos to see them here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {bookmarkedVideos.map((video) => (
                  <Link
                    key={video._id?.toString()}
                    href={`/clips/${video._id}`}
                    className="group relative bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-modern hover:shadow-modern-lg transition-all duration-300 hover:scale-[1.02] block"
                  >
                    {/* Video Thumbnail */}
                    <div className="aspect-[9/16] relative overflow-hidden">
                      <VideoPlayer
                        urlEndpoint={urlEndpoint}
                        src={video.videoUrl}
                        alt={video.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        controls={false}
                        muted
                        loop
                        autoPlay
                        playsInline
                        preload="metadata"
                        poster={video.thumbnailUrl}
                      />

                      {/* Play Overlay */}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 text-sm">
                        {video.caption}
                      </h3>

                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Heart className="w-3 h-3" />
                            <span>{video.likes.length}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{video.comments.length}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(video.createdAt || new Date())}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}