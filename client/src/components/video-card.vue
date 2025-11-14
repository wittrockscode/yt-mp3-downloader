<template lang="pug">
template(v-if="largeScreen")
  .wrapper(:class="{ 'duplicate-animation': duplicateAnimation }")
    .video-card
      .progress-bar(:style="{ width: video.progress + '%' }")
      img.thumbnail(:src="video.thumbnailURL" :alt="`Thumbnail for ${video.title}`")
      .title {{ video.fullTitle }}
      .controls
        .length
          ClockIcon.icon.clock(width="24" height="24")
          | {{ secondsToHms(video.length) }}
        button.download-button(@click="$emit('download-video', video)" :disabled="video.isDownloading")
          template(v-if="video.isDownloading")
            LoadingSpinner
          template(v-else)
            DownloadIcon.icon(width="24" height="24")
            span.text MP3
        template(v-if="video.downloadFinished")
          .check
            CheckIcon.icon(width="24" height="24")
        template(v-else)
          button.remove-button(@click="$emit('remove-video', video)")
            RemoveIcon.icon(width="24" height="24")
    template(v-if="video.error")
      .error-text {{ video.error }}
    template(v-else-if="video.status")
      .status-text {{ video.status }}
template(v-else)
  .wrapper(:class="{ 'duplicate-animation': duplicateAnimation }")
    .elements
      .title {{ video.fullTitle }}
      .video-card
        .progress-bar(:style="{ width: video.progress + '%' }")
        img.thumbnail(:src="video.thumbnailURL" :alt="`Thumbnail for ${video.title}`")
        .length
          ClockIcon.icon.clock(width="24" height="24")
          | {{ secondsToHms(video.length) }}
        button.download-button(@click="$emit('download-video', video)" :disabled="video.isDownloading")
          template(v-if="video.isDownloading")
            LoadingSpinner
          template(v-else)
            DownloadIcon.icon(width="24" height="24")
            span.text MP3
        template(v-if="video.downloadFinished")
          .check
            CheckIcon.icon(width="24" height="24")
        template(v-else)
          button.remove-button(@click="$emit('remove-video', video)")
            RemoveIcon.icon(width="24" height="24")
    template(v-if="video.error")
      .error-text {{ video.error }}
    template(v-else-if="video.status")
      .status-text {{ video.status }}
</template>

<script setup lang="ts">
import type { Video } from '@/composables/use-videos';
import { toRefs, watch } from 'vue';
import LoadingSpinner from './loading-spinner.vue';
import ClockIcon from '../assets/clock.svg';
import RemoveIcon from '../assets/remove.svg';
import DownloadIcon from '../assets/download.svg';
import CheckIcon from '../assets/check.svg';
import { secondsToHms } from '@/composables/helper';
defineEmits<{
  (e: 'remove-video', value: Video): void;
  (e: 'download-video', value: Video): void;
}>();
const props = defineProps<{
  video: Video;
}>();

const { duplicateAnimation } = toRefs(props.video);

watch(duplicateAnimation, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      props.video.duplicateAnimation = false;
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
.wrapper {
  margin-bottom: 0.75rem;
  margin-top: 0.75rem;
}
.status-text {
  color: #CACACA;
  text-align: left;
  margin-top: 0.5rem;
}
.error-text {
  color: #FF2E63;
  text-align: left;
}
.progress-bar {
  width: 0%;
  background-color: #08D9D6;
  position: absolute;
  height: 100%;
  top: 0;
  left: 0;
  border-radius: 8px 0 0 8px;
  z-index: -1;
  opacity: 0.1;
}
.video-card {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  padding: 0.75rem;
  position: relative;
  gap: 1rem;
}
.elements {
  background-color: rgba(255,255,255,0.05);
  border-radius: 8px;
}
.thumbnail {
  width: 60px;
  height: auto;
  border-radius: 4px;
}
.title {
  margin: 0 1rem;
  color: #EAEAEA;
  font-size: 1rem;
  font-weight: 500;
  align-self: center;
  overflow: hidden;
  text-wrap: nowrap;
  text-overflow: ellipsis;
}
.controls {
  display: flex;
  align-items: stretch;
  gap: 1rem;
  align-self: stretch;
}
.length {
  color: #CACACA;
  font-size: 1rem;
  align-self: center;
  text-wrap: nowrap;
}
.icon {
  vertical-align: middle;
}
.clock {
  margin-right: 0.5rem;
}

.text {
  margin-left: 0.5rem;
  font-weight: 600;
  font-size: small;
}

.download-button {
  background-color: rgba(183, 219, 219, 0.05);
  border: none;
  border-radius: 4px;
  color: #08D9D6;
  width: 100%;
}
.remove-button {
  background-color: rgba(255, 100, 100, 0.05);
  border: none;
  border-radius: 4px;
  color: #FF2E63;
  width: 2.5rem;
}

.check {
  background-color: rgba(8, 217, 214, 0.1);
  border-radius: 4px;
  color: #08D9D6;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
}
@media screen and (min-width: 600px) {
  .title {
    flex: 1;
    font-size: 1.2rem;
  }
  .video-card {
    background-color: rgba(255,255,255,0.05);
    border-radius: 8px;
  }

  .download-button {
    transition: transform 0.1s ease-in-out, background-color 0.1s ease-in-out;
    width: 4.5rem;
  }
  .remove-button {
    width: 2.5rem;
    transition: transform 0.1s ease-in-out, background-color 0.1s ease-in-out;
  }
  .check {
    width: 2.5rem;
  }
  .download-button:hover {
    cursor: pointer;
    background-color: rgba(8, 217, 214, 0.1);
    transform: scale(1.05);
  }
  .remove-button:hover {
    cursor: pointer;
    background-color: rgba(255, 46, 99, 0.1);
    transform: scale(1.05);
  }
}
</style>