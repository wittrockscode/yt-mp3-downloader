import type { Video } from "./use-videos"
import { sessionId } from "../socket";

export const useApi = () => {
  const downloadAsMp3 = async (video: Video) => {
    return await fetch("/api/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: video.url,
        sessionId,
        title: video.creator ? `${video.title} - ${video.creator}` : video.title,
        id: video.id,
      }),
    });
  };

  const getVideoInfo = async (url: string) => {
    return await fetch(`/api/info?url=${encodeURIComponent(url)}`, {
      method: "GET",
    });
  };

  return { downloadAsMp3, getVideoInfo };
};