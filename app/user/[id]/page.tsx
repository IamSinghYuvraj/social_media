"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { IVideo } from "@/models/Video";
import { UserPlus, UserMinus, Video as VideoIcon, Calendar, Heart, MessageCircle } from "lucide-react";
import { Video as VideoPlayer } from "@imagekit/next";

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT!;

export default function PublicProfilePage() {
  const params = useParams();
  const userId = useMemo(() => (Array.isArray(params?.id) ? params?.id[0] : (params?.id as string)), [params]);
  const { data: session } = useSession();

  const [profile, setProfile] = useState<null | {
    _id: string;
    username: string;
    email: string;
    profilePicture: string | null;
    followersCount: number;
    followingCount: number;
    videosCount: number;
    isFollowing: boolean;
  }>(null);
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const [p, v] = await Promise.all([
          apiClient.getPublicProfile(userId),
          apiClient.getUserVideos(userId),
        ]);
        if (!mounted) return;
        setProfile(p);
        setVideos(v);
      } catch {
        // no-op minimal error UI
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const onToggleFollow = async () => {
    if (!profile || !session?.user) return;
    try {
      setFollowLoading(true);
      const res = await apiClient.toggleFollow(profile._id);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              isFollowing: res.isFollowing,
              followersCount: res.followersCount,
              followingCount: res.followingCount,
            }
          : prev
      );
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black z-40">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black text-white">Profile not found</div>
    );
  }

  const isMe = session?.user?.id === profile._id;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50/80 via-pink-50/80 to-red-50/80 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 overflow-y-auto">
      <main className="py-8 px-4 sm:px-6 lg:px-8 md:ml-20 min-h-full">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-modern-lg border border-gray-200/30 dark:border-gray-800/30 p-6 sm:p-8 mb-8 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Profile Avatar */}
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center shadow-modern overflow-hidden bg-gray-200 dark:bg-gray-800">
                  {profile.profilePicture ? (
                    <Image
                      src={profile.profilePicture}
                      alt={profile.username}
                      width={128}
                      height={128}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700" />
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 text-crisp">
                  @{profile.username}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {profile.email}
                </p>

                {/* Stats */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <VideoIcon className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      <strong className="text-gray-900 dark:text-white">{profile.videosCount}</strong> Videos
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-pink-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      <strong className="text-gray-900 dark:text-white">{profile.followersCount}</strong> Followers
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      <strong className="text-gray-900 dark:text-white">{profile.followingCount}</strong> Following
                    </span>
                  </div>
                </div>
              </div>

              {/* Follow/Unfollow or Edit */}
              {!isMe && (
                <button
                  onClick={onToggleFollow}
                  disabled={followLoading}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 shadow-modern ${
                    profile.isFollowing ? "bg-gray-800 text-white" : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:scale-105"
                  }`}
                >
                  {profile.isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4" />
                      <span>Unfollow</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              )}
              {isMe && (
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-modern"
                >
                  <span>Edit</span>
                </Link>
              )}
            </div>
          </div>

          {/* Videos Grid */}
          <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-modern-lg border border-gray-200/30 dark:border-gray-800/30 p-6 sm:p-8 backdrop-blur-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 text-crisp">
              {isMe ? "Your Videos" : "Videos"}
            </h2>

            {videos.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <VideoIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                  No videos yet
                </h3>
                {!isMe && (
                  <p className="text-gray-600 dark:text-gray-300">This user hasn't posted any videos yet.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {videos.map((video) => (
                  <Link
                    key={video._id?.toString()}
                    href={`/clips/${video._id}`}
                    className="group relative bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-modern hover:shadow-modern-lg transition-all duration-300 hover:scale-[1.02] block"
                  >
                    <div className="aspect-[9/16] relative overflow-hidden">
                      <VideoPlayer
                        urlEndpoint={urlEndpoint}
                        src={video.videoUrl}
                        alt={video.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        controls={false}
                        muted
                        loop
                        autoPlay
                        playsInline
                        preload="metadata"
                        poster={video.thumbnailUrl}
                      />

                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 text-sm">
                        {video.caption}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Heart className="w-3 h-3" />
                            <span>{video.likes.length}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{video.comments.length}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(video.createdAt || new Date()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
