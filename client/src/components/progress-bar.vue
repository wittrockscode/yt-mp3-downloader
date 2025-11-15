<template lang="pug">
.progress-bar(:style="{ width: progress + '%' }" v-if="progress > 0 && progress <= 100")
</template>

<script setup lang="ts">
const props = defineProps<{
  progress: number;
}>();
</script>

<style scoped>
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
</style>