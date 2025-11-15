import { ref } from "vue";
import { type Video, createVideo } from "./use-videos";

export type Playlist = {
  title: string;
  videoCount: number;
  id: string;
  creator?: string;
  videos: Array<Video>;
  duplicateAnimation: boolean;
  original_url: string | null;
};

export const createPlaylist = (playlistInfoJson: any, original_url: string | null = null): Playlist => {
  return {
    title: playlistInfoJson.title,
    videoCount: playlistInfoJson.entries?.length || 0,
    id: playlistInfoJson.id,
    creator: playlistInfoJson.uploader,
    videos: playlistInfoJson.entries
      ?.filter((entry: any) => entry.duration && entry.uploader && entry.channel)
      ?.map((videoJson: any) => {
        videoJson.original_url = videoJson.url;
        return createVideo(videoJson);
      }) || [],
    duplicateAnimation: false,
    original_url: original_url?.split("&")[0] || null,
  };
};

const playlists = ref<Array<Playlist>>([]);

export const usePlaylists = () => {
  const addPlaylist = (playlist: Playlist) => {
    playlists.value.push(playlist);
  };

  const removePlaylist = (index: number) => {
    playlists.value.splice(index, 1);
  };

  const removePlaylistEntry = (playlist: Playlist, video: Video) => {
    const videoIndex = playlist.videos.findIndex(v => v.id === video.id);
    if (videoIndex !== -1) {
      playlist.videos.splice(videoIndex, 1);
      playlist.videoCount -= 1;
    }
  };

  return {
    playlists,
    addPlaylist,
    removePlaylist,
    removePlaylistEntry,
  };
};