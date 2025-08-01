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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      {/* Header */}
      <Header />
      
      {/* Hero Section */}
      <div className="pt-20 sm:pt-24 pb-8 sm:pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="relative">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight text-crisp">
              <span className="gradient-text block sm:inline">Share Your</span>
              <br />
              <span className="text-gray-900 dark:text-white block sm:inline">Amazing Clips</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
              Join millions of creators sharing their best moments on the most vibrant video platform
            </p>
            
            {/* Floating Elements */}
            <div className="absolute -top-8 -left-8 sm:-top-10 sm:-left-10 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-sm floating" style={{ animationDelay: '0s' }}></div>
            <div className="absolute -top-4 -right-4 sm:-top-5 sm:-right-5 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400/40 to-cyan-400/40 rounded-full blur-sm floating" style={{ animationDelay: '1s' }}></div>
            <div className="absolute -bottom-4 left-1/4 sm:-bottom-5 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-400/35 to-emerald-400/35 rounded-full blur-sm floating" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-white/80 dark:bg-gray-900/80 rounded-2xl overflow-hidden border border-gray-200/30 dark:border-gray-800/30 shadow-modern backdrop-blur-sm">
                  <div className="aspect-[9/16] skeleton rounded-t-2xl"></div>
                  <div className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3 md:space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 skeleton rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 sm:h-4 skeleton rounded w-3/4"></div>
                        <div className="h-2.5 sm:h-3 skeleton rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 sm:h-4 skeleton rounded"></div>
                      <div className="h-3 sm:h-4 skeleton rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <VideoFeed videos={videos} />
          )}
        </div>
      </main>
    </div>
  );
}