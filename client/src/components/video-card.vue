<template lang="pug">
template(v-if="largeScreen")
  .wrapper(:class="{ 'duplicate-animation': duplicateAnimation }" :id="id")
    .video-card
      ProgressBar(:progress="video.progress")
      img.thumbnail(:src="video.thumbnailURL" :alt="`Thumbnail for ${video.title}`")
      .title {{ video.fullTitle }}
      .controls
        .length
          ClockIcon.icon.clock(width="24" height="24")
          | {{ secondsToHms(video.length) }}
        FormatDropdown(
          @format-selected="formatSelected"
          :id="`format-dropdown-${video.id}`"
          :disabled="video.isDownloading || video.downloadFinished"
        )
        DownloadButton(:disabled="video.isDownloading" @download="$emit('download-video', video)")
        RemoveButton(
          @remove="$emit('remove-video', video)"
          :finished="video.downloadFinished"
          :disabled="video.isDownloading"
        )
    template(v-if="video.error")
      .error-text {{ video.error }}
    template(v-else-if="video.status")
      .status-text {{ video.status }}
template(v-else)
  .wrapper(:class="{ 'duplicate-animation': duplicateAnimation }" :id="id")
    .elements
      .title {{ video.fullTitle }}
      .video-card
        ProgressBar(:progress="video.progress")
        img.thumbnail(:src="video.thumbnailURL" :alt="`Thumbnail for ${video.title}`")
        .length
          ClockIcon.icon.clock(width="24" height="24")
          | {{ secondsToHms(video.length) }}
        FormatDropdown(
          @format-selected="formatSelected"
          :id="`format-dropdown-${video.id}`"
          :disabled="video.isDownloading || video.downloadFinished"
        )
        DownloadButton(:disabled="video.isDownloading" @download="$emit('download-video', video)")
        RemoveButton(@remove="$emit('remove-video', video)" :finished="video.downloadFinished" :disabled="video.isDownloading")
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
import DownloadButton from './download-button.vue';
import RemoveButton from './remove-button.vue';
import ProgressBar from './progress-bar.vue';
import FormatDropdown from './format-dropdown.vue';
import { secondsToHms, type AllowedFormats } from '@/composables/helper';
defineEmits<{
  (e: 'remove-video', value: Video): void;
  (e: 'download-video', value: Video): void;
}>();
const props = defineProps<{
  video: Video;
  id?: string;
}>();

const { duplicateAnimation } = toRefs(props.video);

watch(duplicateAnimation, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      props.video.duplicateAnimation = false;
    }, 700);
  }
});

const largeScreen = window.matchMedia('(min-width: 600px)').matches;

const formatSelected = (format: AllowedFormats) => {
  props.video.format = format;
};
</script>

<style scoped>
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
.clock {
  margin-right: 0.5rem;
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
}
</style>