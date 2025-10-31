<template lang="pug">
span.loader(:style="{ borderColor: black ? '#000000ff transparent' : '#08D9D6ff transparent' }")
</template>

<script setup lang="ts">
defineProps<{
  black?: boolean;
}>();
</script>

<style scoped>
.loader {
  width: 24px;
  height: 24px;
  border: 3px solid;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
} 
</style>