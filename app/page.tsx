"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import VideoFeed from "./components/VideoFeed";
import { IVideo } from "@/models/Video";
import { apiClient } from "@/lib/api-client";
import { Camera, Upload, Loader2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getVideos();
        setVideos(data);
      } catch (error) {
        console.error("Error fetching videos:", error);
        setError("Failed to load videos");
      } finally {
        setLoading(false);
      }
    };

    if (status !== "loading") {
      fetchVideos();
    }
  }, [status]);

  const handleVideoUpdate = (updatedVideo: IVideo) => {
    setVideos(prevVideos =>
      prevVideos.map(video =>
        video._id?.toString() === updatedVideo._id?.toString() ? updatedVideo : video
      )
    );
  };
  // Show authentication required screen
  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-pink-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="text-center z-10 px-8">
          <div className="relative inline-block mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <Camera className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-3xl blur-xl animate-pulse"></div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
            Welcome to Clipzy
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-md mx-auto">
            Discover amazing short videos and share your creativity
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-8 py-4 bg-white/10 text-white rounded-2xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-ping opacity-20"></div>
          </div>
          <div className="flex items-center space-x-2">
            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
            <p className="text-white text-lg">Loading videos...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-bold mb-3 text-white">
            Something went wrong
          </h3>
          <p className="text-gray-400 text-lg mb-8">
            {error}
          </p>
          
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show empty state
  if (videos.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-black relative">
        {/* Floating Upload Button */}
        <Link
          href="/upload"
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 z-50"
        >
          <Upload className="w-8 h-8 text-white" />
        </Link>

        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          
          <h3 className="text-3xl font-bold mb-4 text-white">
            No videos yet
          </h3>
          <p className="text-gray-400 text-xl mb-8 max-w-md mx-auto">
            Be the first to share your amazing content with the community!
          </p>
          
          <Link
            href="/upload"
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <Upload className="w-6 h-6" />
            <span>Create Your First Video</span>
          </Link>
        </div>
      </div>
    );
  }

  // Main video feed
  return (
    <div className="h-screen w-full bg-black overflow-hidden mobile-fullscreen">
      {/* Floating Upload Button */}
      <Link
        href="/upload"
        className="fixed bottom-8 right-4 w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 z-50 md:bottom-8 md:right-8 md:w-16 md:h-16"
      >
        <Upload className="w-6 h-6 md:w-8 md:h-8 text-white" />
      </Link>

      {/* Video Feed */}
      <VideoFeed videos={videos} onVideoUpdate={handleVideoUpdate} />
    </div>
  );
}