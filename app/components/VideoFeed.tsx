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
      <div className="mb-6 sm:mb-8 md:mb-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 sm:mb-6 md:mb-8 gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 text-crisp">
              Discover Amazing Clips
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Trending content from creators around the world
            </p>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg sm:rounded-xl font-medium text-sm sm:text-base hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-modern">
              <Fire className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Trending</span>
              <span className="sm:hidden">Hot</span>
            </button>
            <button className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 bg-gray-100/80 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base hover:bg-gray-200/80 dark:hover:bg-gray-700/80 transition-all duration-300 backdrop-blur-sm shadow-sm hover:shadow-modern">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Recent</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <div className="bg-white/80 dark:bg-gray-900/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-200/30 dark:border-gray-800/30 backdrop-blur-sm shadow-modern card-hover">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-modern">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-crisp">2.4M</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total Views</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-900/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-200/30 dark:border-gray-800/30 backdrop-blur-sm shadow-modern card-hover">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-modern">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-crisp">156K</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Creators</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-900/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-200/30 dark:border-gray-800/30 backdrop-blur-sm shadow-modern card-hover">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-modern">
                <Fire className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-crisp">89K</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Clips Today</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-900/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-200/30 dark:border-gray-800/30 backdrop-blur-sm shadow-modern card-hover">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-modern">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-crisp">24/7</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Live Content</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
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
            <div className="text-center py-12 sm:py-16 md:py-20">
              <div className="relative mb-4 sm:mb-6 md:mb-8">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto rounded-full bg-gradient-to-br from-purple-100/80 to-pink-100/80 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center backdrop-blur-sm">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center floating shadow-modern">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 animate-pulse blur-sm"></div>
              </div>
              
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white text-crisp">
                No clips yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base md:text-lg mb-4 sm:mb-6 md:mb-8 max-w-md mx-auto px-4">
                Be the first to share your amazing content with the Clipzy community!
              </p>
              
              <button className="btn-modern px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-modern hover:shadow-modern-lg">
                Create Your First Clip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}