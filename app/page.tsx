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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="relative pt-16 pb-20">
        {loading ? (
          <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 text-sm">Loading clips...</p>
            </div>
          </div>
        ) : (
          <VideoFeed videos={videos} />
        )}
      </main>

    </div>
  );
}