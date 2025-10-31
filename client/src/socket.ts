import { reactive } from "vue";
import { io } from "socket.io-client";
import { useVideos } from "./composables/use-videos";

const { queue } = useVideos();

const URL = import.meta.env.VITE_SERVER_URL ?? "http://localhost:3001";

const state = reactive({
  connected: false,
});

const sessionId = Math.random().toString(36).substring(2, 9);
const socket = io(URL);

socket.connect();
socket.emit("register", sessionId);

socket.on("connect", () => {
  state.connected = true;
});

socket.on("disconnect", () => {
  state.connected = false;
});

socket.on("initializing", (data: any) => {
  const { id } = data.message;
  const video = queue.value.find((v) => v.id === id);
  if (video) {
    video.isDownloading = true;
    video.progress = 0;
    video.error = null;
    video.status = "Initializing...";
  }
});

socket.on("status", (data: any) => {
  const { id, progress } = data.message;
  const video = queue.value.find((v) => v.id === id);
  if (video) {
    video.progress = progress;
    video.status = `Downloading... ${progress.toFixed(2)}%`;
  }
});

socket.on("dlfinished", (data: any) => {
  const { id } = data.message;
  const video = queue.value.find((v) => v.id === id);
  if (video) {
    video.progress = 100;
    video.status = "Processing...";
  }
});

socket.on("finished", (data: any) => {
  const { id } = data.message;
  const video = queue.value.find((v) => v.id === id);
  if (video) {
    video.isDownloading = false;
    video.progress = 0;
    video.downloadFinished = true;
    video.status = null;
  }
});

export { socket, sessionId, state };