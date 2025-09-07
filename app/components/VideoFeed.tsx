
"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { IVideo } from "@/models/Video";
import VideoComponent from "./VideoComponentOptimized";

interface VideoFeedProps {
  videos: IVideo[];
  onVideoUpdate?: (updatedVideo: IVideo) => void;
  loadMore?: () => void;
  hasMore?: boolean;
}

export default function VideoFeed({ videos, onVideoUpdate, loadMore, hasMore }: VideoFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const queryId = searchParams.get("id");
  const pathId = pathname?.startsWith("/clips/") ? pathname.split("/clips/")[1]?.split("/")[0] ?? null : null;
  const currentVideoId = queryId ?? pathId;
  const activeId = currentVideoId ?? videos[0]?._id?.toString() ?? null;

  const activeIndex = useMemo(() => videos.findIndex(v => v._id?.toString() === activeId), [videos, activeId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-id");
            const index = parseInt(entry.target.getAttribute("data-index") || "0", 10);

            if (id && id !== activeId) {
              const onClips = window.location.pathname.startsWith("/clips");
              const newUrl = onClips ? `/clips/${id}` : `${window.location.pathname}?id=${id}`;
              router.replace(newUrl, { scroll: false });
            }

            if (loadMore && hasMore && index >= videos.length - 3) {
              loadMore();
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
  }, [videos, activeId, router, loadMore, hasMore]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
    >
      {videos.map((video, index) => (
        <div
          key={video._id?.toString()}
          data-id={video._id?.toString()}
          data-index={index}
          className="snap-start h-full flex justify-center items-center video-section"
        >
          <VideoComponent
            video={video}
            onVideoUpdate={onVideoUpdate}
            isActive={video._id?.toString() === activeId}
            isNext={index === activeIndex + 1}
            isPrevious={index === activeIndex - 1}
          />
        </div>
      ))}
    </div>
  );
}
