<template lang="pug">
.download-button
  button.button(@click="$emit('download')" :disabled="disabled")
    template(v-if="disabled")
      LoadingSpinner
    template(v-else)
      DownloadIcon.icon(width="24" height="24")
      span.text {{ props.text || 'MP3' }}
</template>

<script setup lang="ts">
import DownloadIcon from '../assets/download.svg';
import LoadingSpinner from './loading-spinner.vue';
defineEmits<{
  (e: 'download'): void;
}>();
const props = defineProps<{
  disabled: boolean;
  text?: string;
}>();
</script>

<style scoped>
.text {
  margin-left: 0.5rem;
  font-weight: 600;
  font-size: small;
}
.button {
  background-color: rgba(183, 219, 219, 0.05);
  border: none;
  border-radius: 4px;
  color: #08D9D6;
  width: 100%;
  height: 100%;
}
@media screen and (min-width: 600px) {
  .button {
    transition: transform 0.1s ease-in-out, background-color 0.1s ease-in-out;
    width: 4.5rem;
  }
  .check {
    width: 2.5rem;
  }
  .button:hover {
    cursor: pointer;
    background-color: rgba(8, 217, 214, 0.1);
    transform: scale(1.05);
  }
}
</style>