import { reactive } from "vue";
import { io } from "socket.io-client";
import { useVideos } from "./composables/use-videos";
import { usePlaylists } from "./composables/use-playlists";

const { videos } = useVideos();
const { playlists } = usePlaylists();

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
  const video = videos.value.find((v) => v.id === id) || playlists.value
    .flatMap(p => p.videos)
    .find((v) => v.id === id);
  if (video) {
    video.isDownloading = true;
    video.progress = 0;
    video.error = null;
    video.status = "Initializing...";
  }
});

socket.on("status", (data: any) => {
  const { id, progress } = data.message;
  const video = videos.value.find((v) => v.id === id) || playlists.value
    .flatMap(p => p.videos)
    .find((v) => v.id === id);
  if (video) {
    video.progress = progress;
    video.status = `Downloading... ${progress.toFixed(2)}%`;
  }
});

socket.on("dlfinished", (data: any) => {
  const { id } = data.message;
  const video = videos.value.find((v) => v.id === id) || playlists.value
    .flatMap(p => p.videos)
    .find((v) => v.id === id);
  if (video) {
    video.progress = 100;
    video.status = "Processing...";
  }
});

socket.on("finished", (data: any) => {
  const { id } = data.message;
  const video = videos.value.find((v) => v.id === id) || playlists.value
    .flatMap(p => p.videos)
    .find((v) => v.id === id);
  if (video) {
    video.isDownloading = false;
    video.progress = 0;
    video.downloadFinished = true;
    video.status = null;
  }
});

socket.on("playlist_initializing", (data: any) => {
  const { id } = data.message;
  const playlist = playlists.value.find((p) => p.id === id);
  if (playlist) {
    playlist.isDownloading = true;
    playlist.progress = 0;
    playlist.error = null;
    playlist.status = "Initializing...";
  }
});

socket.on("playlist_status", (data: any) => {
  const { id, progress } = data.message;
  const playlist = playlists.value.find((p) => p.id === id);
  if (playlist) {
    playlist.progress = progress;
    playlist.status = `Downloading... ${progress.toFixed(2)}%`;
  }
});

socket.on("playlist_dlfinished", (data: any) => {
  const { id } = data.message;
  const playlist = playlists.value.find((p) => p.id === id);
  if (playlist) {
    playlist.progress = 100;
    playlist.status = "Processing...";
  }
});

socket.on("playlist_finished", (data: any) => {
  const { id } = data.message;
  const playlist = playlists.value.find((p) => p.id === id);
  if (playlist) {
    playlist.isDownloading = false;
    playlist.progress = 0;
    playlist.downloadFinished = true;
    playlist.status = null;
  }
});

export { socket, sessionId, state };