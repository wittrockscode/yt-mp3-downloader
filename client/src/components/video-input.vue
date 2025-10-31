<template lang="pug">
.wrapper
  form.video-input(@submit.prevent="$emit('add-video', videoUrl)")
    input.text-field(type="text" placeholder="Enter or paste video URL" v-model="videoUrl")
    button.go-button(type="submit" :disabled="loading")
      template(v-if="loading")
        LoadingSpinner.spinner(black)
      template(v-else)
        | Add video
  .error-text(v-if="errorText") {{ errorText }}
</template>

<script setup lang="ts">
import LoadingSpinner from './loading-spinner.vue';
defineEmits<{
  (e: 'update:videoUrl', value: string): void;
  (e: 'add-video', value: string): void;
}>();
defineProps<{
  loading: boolean;
  errorText?: string;
}>();
const videoUrl = defineModel({ type: String });
</script>

<style scoped>
.error-text {
  color: #FF2E63;
  margin-top: 0.5rem;
  text-align: left;
}
.video-input {
  width: 100%;
  position: relative;
}
.text-field {
  width: 100%;
  padding: 18px 18px;
  font-size: 1.5rem;
  border: 2px solid #08D9D6;
  border-radius: 4px;
  transition: border-width 0.1s ease-in-out;
  background-color: rgba(0, 0, 0, 0.05);
  color: #cacaca;
  font-family: monospace;
}
.text-field:focus {
  outline: none;
  border: 4px solid #08D9D6;
}
.text-field::placeholder {
  color: #868686;
}
.go-button {
  background: #08D9D6;
  border: 0;
  border-radius: 4px;
  color: #252A34;
  padding: 0.5rem;
  right: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  font-family: monospace;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 3rem;
  width: 100%;
  margin-top: 1rem;
}
@media screen and (min-width: 600px) {
  .text-field {
    padding-right: 11rem;
  }
  .go-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    transition: transform 0.1s ease-in-out;
    width: 9rem;
    margin-top: 0;
  }

  .go-button:hover {
    cursor: pointer;
    background: #08d9b6;
    transform: translateY(-50%) scale(1.05);
  }
}
</style>