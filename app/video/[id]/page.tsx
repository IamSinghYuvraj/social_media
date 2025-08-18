"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { IVideo } from "@/models/Video";
import { apiClient } from "@/lib/api-client";
import VideoComponent from "@/app/components/VideoComponentOptimized";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function VideoPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [video, setVideo] = useState<IVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const videoId = params.id as string;

  useEffect(() => {
    const fetchVideo = async () => {
      if (!videoId) return;
      
      try {
        setLoading(true);
        setError(null);
        const videoData = await apiClient.getVideo(videoId);
        setVideo(videoData);
      } catch (error) {
        console.error("Error fetching video:", error);
        setError("Video not found or failed to load");
      } finally {
        setLoading(false);
      }
    };

    if (status !== "loading") {
      fetchVideo();
    }
  }, [videoId, status]);

  const handleVideoUpdate = (updatedVideo: IVideo) => {
    setVideo(updatedVideo);
  };

  // Show authentication required screen
  if (status === "loading") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black dark:bg-black z-40">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-pink-900 dark:from-purple-900 dark:via-black dark:to-pink-900 relative overflow-hidden z-40">
        <div className="text-center z-10 px-8">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
            Sign in Required
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-md mx-auto">
            Please sign in to view this video
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Sign In
            </Link>
            <Link
              href="/"
              className="px-8 py-4 bg-white/10 text-white rounded-2xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black z-40">
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-ping opacity-20"></div>
            </div>
            <div className="flex items-center space-x-2">
              <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
              <p className="text-white text-lg">Loading video...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !video) {
    return (
      <div className="fixed inset-0 bg-black z-40">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            
            <h3 className="text-2xl font-bold mb-3 text-white">
              Video not found
            </h3>
            <p className="text-gray-400 text-lg mb-8">
              {error || "The video you're looking for doesn't exist or has been removed."}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.back()}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Go Back</span>
              </button>
              <Link
                href="/"
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main video page
  return (
    <div className="fixed inset-0 bg-black dark:bg-black z-30">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="fixed top-4 left-4 md:left-24 z-50 flex items-center space-x-2 bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-full transition-all duration-300 backdrop-blur-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      {/* Video Content */}
      <div className="h-full flex items-center justify-center">
        <VideoComponent video={video} onVideoUpdate={handleVideoUpdate} isActive={true} />
      </div>
    </div>
  );
}