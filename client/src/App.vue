<template lang="pug">
.app
  .content
    h1.title
      | YouTube 2 audio
      br
      | mp3 downloader
    VideoInput(
      v-model="videoUrl"
      :loading="loading"
      :error-text="errorText"
      @add-video="init_video_info"
    )
    .videos
      VideoCard(
        v-for="(video, index) in videos"
        :key="index"
        :video="video"
        @download-video="download_video"
        @remove-video="remove_video"
      )
    .playlists
      PlaylistCard(
        v-for="(playlist, index) in playlists"
        :key="index"
        :playlist="playlist"
        @remove-playlist-entry="(e) => removePlaylistEntry(playlist, e)"
        @download-playlist-entry="download_video"
        @remove-playlist="removePlaylist"
        @download-playlist="download_playlist"
      )
</template>

<script setup lang="ts">
import type { Video } from '@/composables/use-videos';
import { ref } from 'vue';
import { socket, sessionId } from "@/socket";
import { generate_downloadable_file } from './composables/helper';
import { useVideos, createVideo } from './composables/use-videos';
import { usePlaylists, createPlaylist, type Playlist } from './composables/use-playlists';
import { useApi } from './composables/use-api';
import VideoInput from './components/video-input.vue';
import VideoCard from './components/video-card.vue';
import PlaylistCard from './components/playlist-card.vue';

const { removeVideo, addVideo, videos } = useVideos();
const { removePlaylist, addPlaylist, removePlaylistEntry, playlists } = usePlaylists();
const { initVideoDownload, initPlaylistDownload, getVideoInfo } = useApi();

const videoUrl = ref<string>('');
const loading = ref<boolean>(false);
const errorText = ref<string | null>(null);

const valid_domain = (url: string): boolean => {
  if (!url) return false;
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname === 'www.youtube.com' || parsedUrl.hostname === 'youtu.be';
  } catch {
    return false;
  }
};

const init_video_info = async (url: string) => {
  if (!valid_domain(url)) {
    errorText.value = 'Please enter a valid YouTube URL.';
    videoUrl.value = '';
    return;
  }
  errorText.value = null;
  loading.value = true;
  const response = await getVideoInfo(url);
  if (!response.ok) {
    const errorData = await response.json();
    errorText.value = errorData || 'Failed to fetch video info.';
    loading.value = false;
    videoUrl.value = '';
    return;
  }
  const videoInfoJson = await response.json();
  loading.value = false;
  videoUrl.value = '';

  if (videoInfoJson._type === 'playlist') {
    const duplicatePlaylist = playlists.value.find(p => p.id === videoInfoJson.id);
    if (duplicatePlaylist) {
      duplicatePlaylist.duplicateAnimation = true;
      return;
    }
    addPlaylist(createPlaylist(videoInfoJson, url));
  } else {
    const duplicateVideo = videos.value.find(v => v.id === videoInfoJson.id);
    if (duplicateVideo) {
      duplicateVideo.duplicateAnimation = true;
      return;
    }
    addVideo(createVideo(videoInfoJson));
  }
};

const remove_video = (video: Video) => {
  const index = videos.value.indexOf(video);
  removeVideo(index);
};

const download_video = async (video: Video) => {
  if (video.blob) {
    generate_downloadable_file(video.blob, `${video.fullTitle}.${video.format}`);
    return;
  }
  const response = await initVideoDownload(video);
  if (!response.ok) {
    const errorData = await response.json();
    video.error = errorData.message || 'Failed to start video download.';
    return;
  }
};

const download_playlist = async (playlist: Playlist) => {
  if (playlist.blob) {
    generate_downloadable_file(playlist.blob, `${playlist.title}.zip`);
    return;
  }

  const response = await initPlaylistDownload(playlist);
  if (!response.ok) {
    const errorData = await response.json();
    playlist.error = errorData.message || 'Failed to start playlist download.';
    return;
  }
};

</script>

<style lang="scss" scoped>
.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: stretch;
}
.content {
  max-width: 95vw;
  width: 100%;
}
@media screen and (min-width: 600px) {
  .content {
    max-width: 50rem;
  }
}
.title {
  text-align: left;
  font-size: 3rem;
  color: #EAEAEA;
  font-weight: bold;
  margin-bottom: 2rem;
  text-shadow: 0 0 1px #000;
}
.videos {
  margin-top: 2rem;
}
@media screen and (min-width: 600px) {
  .title {
    text-align: left;
    margin-top: 20px;
    font-size: 4rem;
    color: #EAEAEA;
    font-weight: bold;
    margin-bottom: 2rem;
    text-shadow: 0 0 1px #000;
  }
}
</style>