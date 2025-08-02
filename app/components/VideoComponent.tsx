import { useRef, useState } from "react";
import { IVideo } from "@/models/Video";
import { Video } from "@imagekit/next";
import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  User,
  MoreHorizontal,
  Play,
} from "lucide-react";

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT!;

export default function VideoComponent({ video }: { video: IVideo }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-black">
      <div className="relative w-[360px] h-[640px] sm:w-[400px] sm:h-[711px] rounded-xl overflow-hidden shadow-xl">
        {/* Video */}
        <Video
          urlEndpoint={urlEndpoint}
          ref={videoRef}
          src={video.videoUrl}
          className="w-full h-full object-cover cursor-pointer"
          onClick={togglePlay}
          muted
          playsInline
          preload="metadata"
          loop
        />

        {/* Play Button */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Play className="w-16 h-16 text-white opacity-80" />
          </div>
        )}

        {/* More Options */}
        <button
          className="absolute top-3 right-3 bg-black/50 p-1 rounded-full hover:bg-black/70 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="w-5 h-5 text-white" />
        </button>

        {/* Overlay Info */}
        <div className="absolute bottom-0 left-0 w-full p-4 text-white bg-gradient-to-t from-black/60 via-black/20 to-transparent">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-3">
              <User className="text-white w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">@creator</p>
              <p className="text-xs text-gray-300">2h ago</p>
            </div>
          </div>

          <h3 className="text-base font-bold mb-1">{video.title}</h3>
          <p className="text-sm text-gray-200 mb-4">{video.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`flex items-center space-x-1 ${
                  isLiked ? "text-red-500" : "text-gray-300"
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                <span className="text-sm">1.2K</span>
              </button>

              <button className="flex items-center space-x-1 text-gray-300">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">89</span>
              </button>

              <button className="flex items-center space-x-1 text-gray-300">
                <Share className="w-5 h-5" />
                <span className="text-sm hidden sm:inline">Share</span>
              </button>
            </div>

            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={isBookmarked ? "text-yellow-400" : "text-gray-300"}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
