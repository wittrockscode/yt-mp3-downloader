<template lang="pug">
.playlist-card(:class="{ 'duplicate-animation': duplicateAnimation }")
  .header
    .title {{ fullTitle }}
    .controls
      DownloadButton(:disabled="playlist.isDownloading" @download="$emit('download-playlist', playlist)" text="Full Playlist")
      RemoveButton(@remove="$emit('remove-playlist', playlist)" :finished="playlist.downloadFinished" :disabled="removeDisabled")
  .videos
    VideoCard(
      v-for="(video, index) in playlist.videos"
      :key="index"
      :video="video"
      :id="video.id"
      @remove-video="$emit('remove-playlist-entry', video)"
      @download-video="$emit('download-playlist-entry', video)"
    )
</template>

<script setup lang="ts">
import { toRefs, watch, computed, onMounted } from 'vue';
import type { Playlist } from '@/composables/use-playlists';
import type { Video } from '@/composables/use-videos';
import VideoCard from './video-card.vue';
import DownloadButton from './download-button.vue';
import RemoveButton from './remove-button.vue';
defineEmits<{
  (e: 'remove-playlist', value: Playlist): void;
  (e: 'remove-playlist-entry', value: Video): void;
  (e: 'download-playlist-entry', value: Video): void;
  (e: 'download-playlist', value: Playlist): void;
}>();
const props = defineProps<{
  playlist: Playlist;
}>();

const fullTitle = computed(() => {
  return `${props.playlist.title} ${props.playlist.creator ? `by ${props.playlist.creator}` : ''}`;
});

const removeDisabled = computed(() => {
  return props.playlist.isDownloading || props.playlist.videos.some(video => video.isDownloading);
});

const { duplicateAnimation } = toRefs(props.playlist);

watch(duplicateAnimation, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      props.playlist.duplicateAnimation = false;
    }, 500);
  }
});
const largeScreen = window.matchMedia('(min-width: 600px)').matches;

onMounted(() => {
  if (props.playlist.original_url) {
    const item_to_scroll_to = props.playlist.videos.find(video => video.url === props.playlist.original_url);
    if (item_to_scroll_to) {
      const element = document.getElementById(item_to_scroll_to.id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        item_to_scroll_to.duplicateAnimation = true;
      }
    }
  }
});
</script>

<style scoped>
.playlist-card {
  border-radius: 8px;
  padding: 0.5rem 1rem;
  margin-bottom: 16px;
  background-color: rgba(0,0,0,0.1);
}
.header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #868686;
}
.title {
  font-size: 1.4rem;
  font-weight: bold;
  color: #cacaca;
}
.videos {
  max-height: 15rem;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #555 transparent;
}
.controls {
  display: flex;
  gap: 1rem;
}
</style>