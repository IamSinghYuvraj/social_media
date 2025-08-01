import { IVideo } from "@/models/Video";
import VideoComponent from "./VideoComponent";
import { Sparkles, TrendingUp, Clock, Siren as Fire } from "lucide-react";

interface VideoFeedProps {
  videos: IVideo[];
}

export default function VideoFeed({ videos }: VideoFeedProps) {
  return (
    <div className="w-full">
      {/* Feed Header */}
      <div className="mb-8 md:mb-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Discover Amazing Clips
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Trending content from creators around the world
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 hover:scale-105 shadow-lg">
              <Fire className="w-4 h-4" />
              <span>Trending</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200">
              <Clock className="w-4 h-4" />
              <span>Recent</span>
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 md:p-6 border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">2.4M</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Views</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 md:p-6 border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">156K</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Creators</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 md:p-6 border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Fire className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">89K</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Clips Today</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 md:p-6 border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">24/7</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Live Content</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8">
        {videos.map((video, index) => (
          <div 
            key={video._id?.toString()} 
            className="fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <VideoComponent video={video} />
          </div>
        ))}

        {videos.length === 0 && (
          <div className="col-span-full">
            <div className="text-center py-16 md:py-20">
              <div className="relative mb-6 md:mb-8">
                <div className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center floating">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 animate-pulse"></div>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                No clips yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg mb-6 md:mb-8 max-w-md mx-auto">
                Be the first to share your amazing content with the Clipzy community!
              </p>
              
              <button className="btn-modern px-6 md:px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                Create Your First Clip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}