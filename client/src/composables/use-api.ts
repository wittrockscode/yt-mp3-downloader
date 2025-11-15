import type { Video } from "./use-videos"
import type { Playlist } from "./use-playlists";
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
        title: video.fullTitle,
        id: video.id,
      }),
    });
  };

  const getVideoInfo = async (url: string) => {
    return await fetch(`/api/info?url=${encodeURIComponent(url)}`, {
      method: "GET",
    });
  };

  const downloadPlaylistAsZip = async (playlistId: Playlist) => {
    return await fetch("/api/download_playlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: playlistId.id,
        sessionId,
        title: playlistId.title,
        items: playlistId.videos.map(video => ({
          url: video.url,
          title: video.fullTitle,
          id: video.id,
        })),
      }),
    });
  };

  return { downloadAsMp3, getVideoInfo, downloadPlaylistAsZip };
};