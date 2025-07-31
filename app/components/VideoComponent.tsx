import { IKVideo } from "imagekitio-next";
import { IVideo } from "@/models/Video";
import { Heart, MessageCircle, Share, Bookmark, User } from "lucide-react";
import { useState } from "react";

export default function VideoComponent({ video }: { video: IVideo }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all duration-200 hover-lift">
      {/* Video Container */}
      <div className="relative">
        <div className="aspect-square w-full">
          <IKVideo
            path={video.videoUrl}
            transformation={[
              {
                height: "1080",
                width: "1080",
              },
            ]}
            controls={video.controls}
            className="w-full h-full object-cover"
            muted
          />
        </div>
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
          <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Description */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">{video.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{video.description}</p>
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <User className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">@user</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`flex items-center space-x-1 transition-colors ${
                isLiked ? 'text-red-500' : 'text-gray-600 dark:text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">123</span>
            </button>
            
            <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">12</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
              <Share className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`transition-colors ${
                isBookmarked ? 'text-yellow-500' : 'text-gray-600 dark:text-gray-400 hover:text-yellow-500'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}