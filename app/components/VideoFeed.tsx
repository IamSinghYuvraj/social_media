// import { IVideo } from "@/models/Video";
// import VideoComponent from "./VideoComponentOptimized";
// interface VideoFeedProps {
//   videos: IVideo[];
// }

// export default function VideoFeed({ videos }: VideoFeedProps) {
//   return (
//     <div className="w-full ">
//       {/* Video Grid */}
//       <div className="pt-15 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
//         {videos.map((video) => (
//           <div 
//             key={video._id?.toString()}           >
//             <VideoComponent video={video} isActive={false} />
//           </div>
//         ))}

//         {videos.length === 0 && (
//           <div className="col-span-full">
//             <div className="text-center py-12 sm:py-16 md:py-20">
//               <div className="relative mb-4 sm:mb-6 md:mb-8">
//                 <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto rounded-full bg-gradient-to-br from-purple-100/80 to-pink-100/80 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center backdrop-blur-sm">
//                   <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center floating shadow-modern">
//                     <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
//                     </svg>
//                   </div>
//                 </div>
//                 <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 animate-pulse blur-sm"></div>
//               </div>
              
//               <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white text-crisp">
//                 No clips yet
//               </h3>
//               <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base md:text-lg mb-4 sm:mb-6 md:mb-8 max-w-md mx-auto px-4">
//                 Be the first to share your amazing content with the Clipzy community!
//               </p>
              
//               <button className="btn-modern px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-modern hover:shadow-modern-lg">
//                 Create Your First Clip
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IVideo } from "@/models/Video";
import VideoComponent from "./VideoComponentOptimized";

interface VideoFeedProps {
  videos: IVideo[];
  onVideoUpdate?: (updatedVideo: IVideo) => void;
}

export default function VideoFeed({ videos, onVideoUpdate }: VideoFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentVideoId = searchParams.get("id");
  const activeId = currentVideoId ?? videos[0]?._id?.toString() ?? null;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-id");
            if (id && id !== currentVideoId) {
              const newUrl = `${window.location.pathname}?id=${id}`;
              router.replace(newUrl, { scroll: false });
            }
          }
        }
      },
      {
        threshold: 0.7,
      }
    );

    const elements = container.querySelectorAll(".video-section");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [videos, currentVideoId, router]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
    >
      {videos.map((video) => (
        <div
          key={video._id?.toString()}
          data-id={video._id?.toString()}
          className="snap-start h-full flex justify-center items-center video-section"
        >
          <VideoComponent
            video={video}
            onVideoUpdate={onVideoUpdate}
            isActive={video._id?.toString() === activeId}
          />
        </div>
      ))}
    </div>
  );
}
