import type { Video } from "./use-videos"
import type { Playlist } from "./use-playlists";
import { sessionId } from "../socket";

export const useApi = () => {
  const initVideoDownload = async (video: Video) => {
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
        format: video.format,
      }),
    });
  };

  const getVideoInfo = async (url: string) => {
    return await fetch(`/api/info?url=${encodeURIComponent(url)}`, {
      method: "GET",
    });
  };

  const initPlaylistDownload = async (playlist: Playlist) => {
    return await fetch("/api/download_playlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: playlist.id,
        sessionId,
        items: playlist.videos.map(video => ({
          url: video.url,
          title: video.fullTitle,
          id: video.id,
        })),
        format: playlist.format,
      }),
    });
  };

  const downloadVideo = async (video: Video) => {
    return await fetch("/api/download/dl", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: video.id,
        sessionId,
        title: video.fullTitle,
        format: video.format,
      }),
    });
  };

  const downloadPlaylistAsZip = async (playlist: Playlist) => {
    return await fetch("/api/download_playlist/dl", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: playlist.id,
        sessionId,
        title: playlist.title
      }),
    });
  }

  return { initVideoDownload, downloadVideo, getVideoInfo, initPlaylistDownload, downloadPlaylistAsZip };
};