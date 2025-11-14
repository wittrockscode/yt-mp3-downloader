import { YtDlp } from "ytdlp-nodejs";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";

ffmpeg.setFfmpegPath(ffmpegPath);

const incorrectUrl = (url: string | undefined) => {
  if (!url) return true;
  const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return !urlPattern.test(url);
};

const ytdlp = new YtDlp({
  ffmpegPath: ffmpegPath,
});

export { ffmpeg, ytdlp, incorrectUrl };