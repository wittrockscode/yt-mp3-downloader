<template lang="pug">
.app
  h1.title Youtube MP3 Downloader
  form.download-form(@submit.prevent="downloadMP3")
    input.text-field(type="text" placeholder="Enter video URL" v-model="videoUrl")
    button.download-button(type="submit") Download
  p.error(v-if="error") {{ error }}
  p.video-title(v-if="isDownloading && fileTitle !== 'audio.mp3'") Downloading: {{ fileTitle }}
  .downloading
    span.loader(v-if="isDownloading")
    p.status(v-text="statusText")
  ul.downloaded-list(v-if="downloaded.length")
    li(v-for="(item, index) in downloaded" :key="index") {{ item }}
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { socket } from "@/socket";

const videoUrl = ref('');
const fileTitle = ref('audio.mp3');
const downloadStatus = ref(0);
const isDownloading = ref(false);
const sessionId = Math.random().toString(36).substring(2, 9);
const statusText = ref("");
const error = ref("");
const downloaded = ref<string[]>([]);

socket.connect();
socket.emit("register", sessionId);

socket.on("title", (data) => {
  fileTitle.value = data.message + ".mp3";
});
socket.on("initializing", (data) => {
  isDownloading.value = true;
  statusText.value = "Initializing...";
});
socket.on("status", (data) => {
  downloadStatus.value = data.message;
  statusText.value = `Downloading: ${downloadStatus.value}%`;
});
socket.on("finished", (data) => {
  downloadStatus.value = 0;
  isDownloading.value = false;
  statusText.value = "Done!";
});
socket.on("dlfinished", (data) => {
  downloadStatus.value = 0;
  statusText.value = "Converting to MP3...";
});

const downloadMP3 = async () => {
  error.value = "";
  const response = await fetch("/api/download", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: videoUrl.value, sessionId }),
  });

  if (!response.ok) {
    const err = await response.text();
    error.value = err || "Download failed";
    isDownloading.value = false;
    statusText.value = "";
    return;
  }

  const blob = await response.blob();
  const newBlob = new Blob([blob]);
  const url = window.URL.createObjectURL(newBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileTitle.value;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
  downloaded.value.push(fileTitle.value);
  fileTitle.value = "audio.mp3";
  videoUrl.value = "";
  isDownloading.value = false;
};
</script>

<style lang="scss" scoped>
.app {
  max-width: max(80vw, 900px);
  margin: 5em auto;
  padding: 20px;
  border: 1px solid #ccccccff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
}
.title {
  text-align: center;
  font-size: 32px;
  margin-bottom: 20px;
  color: #333;
  font-weight: bold;
}
.download-form {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.text-field {
  width: 100%;
  height: 44px;
  padding: 10px;
  border: 1px solid #ccc;
  color: #333;
  margin-right: 10px;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
  &:focus {
    border-color: #38ef7d;
    outline: none;
    box-shadow: 0 0 5px rgba(56, 239, 125, 0.5);
  }
}
.download-button {
  height: 44px;
  padding: 0 20px;
  background: linear-gradient(90deg, #38ef7d 0%, #11998e 100%);
  color: #fcfcfcff;
  border: none;
  border-radius: 4px;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 14px 0 rgba(56,239,125,0.15);
  transition:  all 0.3s ease;
  font-weight: bold;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  &:hover {
    transform: scale(1.04);
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    box-shadow: none;
  }
}
.status {
  font-size: 20px;
  color: #555;
}
.video-title {
  text-align: left;
  margin-bottom: 20px;
  font-size: 12px;
  color: #333;
}
.error {
  color: red;
  margin-bottom: 10px;
}
.downloaded-list {
  margin-top: 20px;
  padding-left: 20px;
  list-style-type: disc;
  color: #333;
}
.loader {
  width: 30px;
  height: 30px;
  border: 3px solid;
  border-color: #006622ff transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}
.downloading {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
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