
"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const queryId = searchParams.get("id");
  const pathId = pathname?.startsWith("/clips/") ? pathname.split("/clips/")[1]?.split("/")[0] ?? null : null;
  const currentVideoId = queryId ?? pathId;
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
              const onClips = window.location.pathname.startsWith("/clips");
              const newUrl = onClips ? `/clips/${id}` : `${window.location.pathname}?id=${id}`;
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
