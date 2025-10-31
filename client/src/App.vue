<template lang="pug">
.app
  .content
    h1.title YouTube 2 Mp3 Downloader
    VideoInput(
      v-model="videoUrl"
      :loading="loading"
      :error-text="errorText"
      @add-video="init_video_info"
    )
    .queue
      VideoCard(
        v-for="(video, index) in queue"
        :key="index"
        :video="video"
        @download-video="download_video"
        @remove-video="remove_video"
      )
</template>

<script setup lang="ts">
import type { Video } from '@/composables/use-videos';
import { ref } from 'vue';
import { socket, sessionId } from "@/socket";
import { generate_downloadable_file } from './composables/helper';
import { useVideos } from './composables/use-videos';
import { useApi } from './composables/use-api';
import VideoInput from './components/video-input.vue';
import VideoCard from './components/video-card.vue';

const { removeVideo, createVideo, queue } = useVideos();
const { downloadAsMp3, getVideoInfo } = useApi();

const videoUrl = ref<string>('');
const loading = ref<boolean>(false);
const errorText = ref<string | null>(null);

const init_video_info = async (url: string) => {
  loading.value = true;
  const response = await getVideoInfo(url);
  if (!response.ok) {
    const errorData = await response.json();
    errorText.value = errorData.message || 'Failed to fetch video info.';
    loading.value = false;
    return;
  }
  const videoInfoJson = await response.json();
  createVideo(videoInfoJson);
  loading.value = false;
  videoUrl.value = '';
};

const remove_video = (video: Video) => {
  const index = queue.value.indexOf(video);
  removeVideo(index);
};

const download_video = async (video: Video) => {
  if (video.blob) {
    generate_downloadable_file(video.blob, `${video.fullTitle}.mp3`);
    return;
  }
  const response = await downloadAsMp3(video);
  if (!response.ok) {
    const errorData = await response.json();
    video.error = errorData.message || 'Failed to download video.';
    return;
  }
  const blob = await response.blob();
  video.blob = blob;
  generate_downloadable_file(blob, `${video.fullTitle}.mp3`);
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
.queue {
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