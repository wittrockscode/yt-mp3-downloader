<template lang="pug">
.format-dropdown
  select(v-model="selectedFormat" @change="$emit('format-selected', selectedFormat)" :id="id" :disabled="disabled")
    option(value="mp3") MP3
    option(value="mp4") MP4
</template>

<script lang="ts" setup>
import type { AllowedFormats } from '@/composables/helper';
import { ref } from 'vue';
defineEmits<{
  (e: 'format-selected', value: AllowedFormats): void;
}>();
defineProps<{
  id: string;
  disabled?: boolean;
}>();
const selectedFormat = ref<AllowedFormats>('mp3');
</script>

<style scoped>
.format-dropdown {
  select {
    background-color: rgba(183, 219, 219, 0.05);
    border: none;
    border-radius: 4px;
    color: #EAEAEA;
    padding: 0.25rem;
    font-weight: 600;
    font-size: small;
    width: 100%;
    height: 100%;
  }
  option {
    background-color: #252A34;
    color: #CACACA;
  }
  @media screen and (min-width: 600px) {
    select {
      transition: transform 0.1s ease-in-out, background-color 0.1s ease-in-out;
      width: auto;
    }
    select:hover {
      cursor: pointer;
      background-color: rgba(8, 217, 214, 0.1);
      transform: scale(1.05);
    }
  }
}
</style>