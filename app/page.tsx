"use client";

import React, { useEffect, useState } from "react";
import VideoFeed from "./components/VideoFeed";
import { IVideo } from "@/models/Video";
import { apiClient } from "@/lib/api-client";
import Header from "./components/Header";

export default function Home() {
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getVideos();
        setVideos(data);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <Header />
      
      {/* Hero Section */}
      <div className="pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="relative">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="gradient-text">Share Your</span>
              <br />
              <span className="text-gray-900 dark:text-white">Amazing Clips</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join millions of creators sharing their best moments on the most vibrant video platform
            </p>
            
            {/* Floating Elements */}
            <div className="absolute -top-10 -left-10 w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 floating" style={{ animationDelay: '0s' }}></div>
            <div className="absolute -top-5 -right-5 w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-30 floating" style={{ animationDelay: '1s' }}></div>
            <div className="absolute -bottom-5 left-1/4 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full opacity-25 floating" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="pb-16 px-6">
        {loading ? (
          <div className="max-w-7xl mx-auto">
            {/* Loading Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-200/50 dark:border-gray-800/50">
                  <div className="aspect-[9/16] skeleton"></div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 skeleton rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 skeleton rounded w-3/4"></div>
                        <div className="h-3 skeleton rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 skeleton rounded"></div>
                      <div className="h-4 skeleton rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <VideoFeed videos={videos} />
        )}
      </main>
    </div>
  );
}