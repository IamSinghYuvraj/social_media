import { IKVideo } from "imagekitio-next";
import { IVideo } from "@/models/Video";
import { Heart, MessageCircle, Share, Bookmark, User, Play, MoreHorizontal } from "lucide-react";
import { useState } from "react";

export default function VideoComponent({ video }: { video: IVideo }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="group bg-white/90 dark:bg-gray-900/90 rounded-2xl sm:rounded-3xl shadow-modern border border-gray-200/30 dark:border-gray-800/30 overflow-hidden card-hover backdrop-blur-sm">
      {/* Video Container */}
      <div className="relative overflow-hidden rounded-t-2xl sm:rounded-t-3xl">
        <div className="aspect-[9/16] w-full bg-gradient-to-br from-gray-100/80 to-gray-200/80 dark:from-gray-800/80 dark:to-gray-900/80">
          <IKVideo
            path={video.videoUrl}
            transformation={[
              {
                height: "1080",
                width: "1080",
              },
            ]}
            controls={video.controls}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            muted
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </div>
        
        {/* Play Button Overlay */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-400 ${
          isPlaying ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-modern-lg transform scale-90 group-hover:scale-100 transition-all duration-300">
            <Play className="w-5 h-5 sm:w-7 sm:h-7 text-gray-800 dark:text-white ml-0.5 sm:ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>

        {/* More Options */}
        <button className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/30 hover:scale-110">
          <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 md:p-6">
        {/* User Info */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-modern">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"></div>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white text-crisp">@creator</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">2h ago</p>
            </div>
          </div>
          
          <button className="px-3 sm:px-4 py-1 sm:py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs sm:text-sm font-medium rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-modern">
            Follow
          </button>
        </div>

        {/* Title and Description */}
        <div className="mb-3 sm:mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2 line-clamp-2 text-sm sm:text-base md:text-lg leading-tight text-crisp">
            {video.title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
            {video.description}
          </p>
        </div>

        {/* Hashtags */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          <span className="text-xs px-2 py-0.5 sm:py-1 bg-purple-100/80 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full font-medium backdrop-blur-sm">
            #trending
          </span>
          <span className="text-xs px-2 py-0.5 sm:py-1 bg-pink-100/80 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full font-medium backdrop-blur-sm">
            #viral
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100/50 dark:border-gray-800/50">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`flex items-center space-x-1.5 sm:space-x-2 transition-all duration-300 hover:scale-105 ${
                isLiked 
                  ? 'text-red-500' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-red-500'
              }`}
            >
              <div className="relative">
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked && (
                  <div className="absolute inset-0 animate-ping">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-red-500 opacity-75" />
                  </div>
                )}
              </div>
              <span className="text-xs sm:text-sm font-semibold">1.2K</span>
            </button>
            
            <button className="flex items-center space-x-1.5 sm:space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-all duration-300 hover:scale-105">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-semibold">89</span>
            </button>

            <button className="flex items-center space-x-1.5 sm:space-x-2 text-gray-600 dark:text-gray-400 hover:text-green-500 transition-all duration-300 hover:scale-105">
              <Share className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-semibold hidden sm:inline">Share</span>
            </button>
          </div>

          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`transition-all duration-300 hover:scale-105 p-1 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 ${
              isBookmarked 
                ? 'text-yellow-500' 
                : 'text-gray-600 dark:text-gray-400 hover:text-yellow-500'
            }`}
          >
            <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}