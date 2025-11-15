<template lang="pug">
.remove-button
  template(v-if="finished")
    .check
      CheckIcon.icon(width="24" height="24")
  template(v-else)
    button.button(@click="$emit('remove')" :disabled="disabled" :class="{ disabled: disabled }")
      RemoveIcon.icon(width="24" height="24")
</template>

<script setup lang="ts">
import CheckIcon from '../assets/check.svg';
import RemoveIcon from '../assets/remove.svg';
defineEmits<{
  (e: 'remove'): void;
}>();
const props = defineProps<{
  finished: boolean;
  disabled?: boolean;
}>();
</script>

<style scoped>
.button {
  background-color: rgba(255, 100, 100, 0.05);
  border: none;
  border-radius: 4px;
  color: #FF2E63;
  width: 2.5rem;
  height: 100%;
}
.check {
  background-color: rgba(8, 217, 214, 0.1);
  border-radius: 4px;
  color: #08D9D6;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 100%;
}
.disabled {
  cursor: not-allowed;
  background-color: rgba(255, 100, 100, 0.05);
}

@media screen and (min-width: 600px) {
  .button {
    width: 2.5rem;
    transition: transform 0.1s ease-in-out, background-color 0.1s ease-in-out;
  }
  .button:hover {
    cursor: pointer;
    background-color: rgba(255, 46, 99, 0.1);
    transform: scale(1.05);
  }
  .button.disabled {
    cursor: not-allowed;
    background-color: rgba(255, 46, 99, 0.05);
    color: #881935;
  }
}
</style>