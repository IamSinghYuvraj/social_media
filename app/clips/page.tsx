"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { IVideo } from "@/models/Video";
import VideoFeed from "@/app/components/VideoFeed";

export default function ClipsPage() {
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getVideos();
        if (!mounted) return;
        setVideos(data);
        if (data.length > 0) {
          router.replace(`/clips/${data[0]._id}`);
        }
      } catch (error) {
        console.error("Failed to load clips:", error);
        setError(error instanceof Error ? error.message : "Failed to load clips");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading) return <div className="fixed inset-0 flex items-center justify-center bg-black text-white">Loading...</div>;
  if (error) return <div className="fixed inset-0 flex items-center justify-center bg-black text-white">{error}</div>;
  if (videos.length === 0) return <div className="fixed inset-0 flex items-center justify-center bg-black text-white">No clips yet</div>;

  return (
    <div className="fixed inset-0 w-full bg-black overflow-hidden">
      <VideoFeed videos={videos} onVideoUpdate={() => {}} />
    </div>
  );
}
