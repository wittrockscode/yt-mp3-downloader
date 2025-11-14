<template lang="pug">
.playlist-card(:class="{ 'duplicate-animation': duplicateAnimation }")
  .controls
    .title {{ fullTitle }}
    button.remove-button(@click="$emit('remove-playlist', playlist)")
      RemoveIcon.icon(width="24" height="24")
  .videos
    VideoCard(
      v-for="(video, index) in playlist.videos"
      :key="index"
      :video="video"
      @remove-video="$emit('remove-playlist-entry', video)"
      @download-video="$emit('download-playlist-entry', video)"
    )
</template>

<script setup lang="ts">
import { toRefs, watch, computed } from 'vue';
import type { Playlist } from '@/composables/use-playlists';
import type { Video } from '@/composables/use-videos';
import VideoCard from './video-card.vue';
import RemoveIcon from '../assets/remove.svg';
defineEmits<{
  (e: 'remove-playlist', value: Playlist): void;
  (e: 'remove-playlist-entry', value: Video): void;
  (e: 'download-playlist-entry', value: Video): void;
}>();
const props = defineProps<{
  playlist: Playlist;
}>();

const fullTitle = computed(() => {
  return `${props.playlist.title} ${props.playlist.creator ? `by ${props.playlist.creator}` : ''}`;
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
</script>

<style scoped>
.duplicate-animation {
  animation: duplicate-flash 0.5s ease-in-out;
}
@keyframes duplicate-flash {
  0%, 100% {
    background-color: rgba(255, 255, 255, 0.1);
  }
  50% {
    background-color: rgba(255, 255, 255, 0.3);
  }
}

.playlist-card {
  border-radius: 8px;
  padding: 0.5rem 1rem;
  margin-bottom: 16px;
  background-color: rgba(0,0,0,0.1);
}
.controls {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.25rem;
  border-bottom: 2px solid #868686;
}
.title {
  font-size: 1.4rem;
  font-weight: bold;
  color: #cacaca;
}
.remove-button {
  background-color: rgba(255, 100, 100, 0.05);
  border: none;
  border-radius: 4px;
  color: #FF2E63;
  width: 2.5rem;
}
@media screen and (min-width: 600px) {
  .remove-button {
    transition: transform 0.1s ease-in-out, background-color 0.1s ease-in-out;
  }
  .remove-button:hover {
    cursor: pointer;
    background-color: rgba(255, 46, 99, 0.1);
    transform: scale(1.05);
  }
}
</style>