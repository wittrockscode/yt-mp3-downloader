import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import path from "path";
import sanitize from "sanitize-filename";

const incorrectUrl = (url: string | undefined) => {
  if (!url) return true;
  const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return !urlPattern.test(url);
};

const getYtDlpPath = () => {
  const base = path.join(__dirname, "..", "bin");

  switch (process.platform) {
    case "win32":
      return path.join(base, "yt-dlp.exe");
    case "linux":
      return path.join(base, "yt-dlp_linux");
    default:
      throw new Error("Unsupported platform: " + process.platform);
  }
};

const ytdlpConfig = (url: string, format: string, outDir: string, title: string) => {
  const mp4config = [
    "--no-config",
    "--newline",
    "--progress",
    "--progress-template",
    "download:%(progress._percent_str)s %(progress._total_bytes_str)s %(progress._speed_str)s %(progress._eta_str)s",
    url,
    "-f", "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4] / bv*+ba/b",
    "--remux-video", "mp4",
    "--ffmpeg-location", ffmpegPath,
    "-o", `${outDir}/${sanitize(title)}.%(ext)s`,
  ];

  const mp3config = [
    "--no-config",
    "--newline",
    "--progress",
    "--progress-template",
    "download:%(progress._percent_str)s %(progress._total_bytes_str)s %(progress._speed_str)s %(progress._eta_str)s",
    url,
    "-x",
    "--audio-format", "mp3",
    "--ffmpeg-location", ffmpegPath,
    "-o", `${outDir}/${sanitize(title)}.%(ext)s`,
  ];

  return format === 'mp4' ? mp4config : mp3config;
};

const timeouts: Map<string, NodeJS.Timeout> = new Map();

export { incorrectUrl, getYtDlpPath, ytdlpConfig, ffmpegPath, timeouts };