import express from "express";
import { YtDlp } from "ytdlp-nodejs";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import { Readable } from "stream";

ffmpeg.setFfmpegPath(ffmpegPath);

const router = express.Router();
const ytdlp = new YtDlp({
  ffmpegPath: ffmpegPath,
});

const incorrectUrl = (url: string) => {
  const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return !urlPattern.test(url);
};

router.post('/', async (req, res) => {
  const url = req.body.url.split("&")[0];
  const { sessionId } = req.body;
  const sockets = req.app.get("sockets");
  const socket = sockets.get(sessionId);

  if (!socket) return res.status(400).send('Invalid session ID, reload the page and try again.');
  if (socket) socket.emit("initializing", { message: true });

  try {
    if (incorrectUrl(url)) return res.status(400).send('Invalid URL: ' + url);

    const title = await ytdlp.getTitleAsync(url);
    socket.emit("title", { message: title });

    const file = await ytdlp.getFileAsync(
      url,
      {
        format: {
          filter: 'audioandvideo',
          type: 'mp4',
          quality: 'highest',
        },
        filename: `${title}.mp4`,
        onProgress: (progress) => {
          socket.emit("status", { message: progress.percentage });
        },
      }
    );

    socket.emit("dlfinished", { message: true });
    const stream = Readable.from(file.stream());

    ffmpeg(stream).noVideo().format('mp3').on("error", (err) => {
      res.status(500).send('Error processing video: ' + err.message);
    }).on("end", () => {
      socket.emit("finished", { message: true });
    }).pipe(res, { end: true });
  } catch (error) {
    res.status(500).send('Internal Server Error: ' + error);
  }
});

export default router;
