import { IVideo, ICaption } from "@/models/Video";

export type VideoFormData = Omit<IVideo, "_id" | "userId" | "userEmail" | "likes" | "comments">;

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

class ApiClient {
  private async fetch<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { method = "GET", body, headers = {} } = options;

    const defaultHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };

    const response = await fetch(`/api${endpoint}`, {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  }

  async getVideos() {
    return this.fetch<IVideo[]>("/videos");
  }

  async getVideo(id: string) {
    return this.fetch<IVideo>(`/videos/${id}`);
  }

  async getUserVideos(userId: string) {
    return this.fetch<IVideo[]>(`/videos/user/${userId}`);
  }
  async createVideo(videoData: VideoFormData) {
    return this.fetch<IVideo>("/videos", {
      method: "POST",
      body: videoData,
    });
  }

  async likeVideo(videoId: string) {
    return this.fetch<IVideo>(`/videos/${videoId}`, {
      method: "PUT",
      body: { action: "like" },
    });
  }

  async commentOnVideo(videoId: string, text: string) {
    return this.fetch<IVideo>(`/videos/${videoId}`, {
      method: "PUT",
      body: { action: "comment", text },
    });
  }

  async replyToComment(videoId: string, parentCommentId: string, text: string) {
    return this.fetch<IVideo>(`/videos/${videoId}`, {
      method: "PUT",
      body: { action: "reply", parentCommentId, text },
    });
  }

  async updateCaptions(videoId: string, captions: ICaption[]) {
    return this.fetch<IVideo>(`/videos/${videoId}`, {
      method: "PUT",
      body: { action: "update_captions", captions },
    });
  }

  async deleteVideo(videoId: string) {
    return this.fetch<{ success: boolean }>(`/videos/${videoId}`, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient();