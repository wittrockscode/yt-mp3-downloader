import express from "express";
import { Readable } from "stream";
import { ytdlp, ffmpeg, incorrectUrl } from "./misc";

const router = express.Router();

router.post('/', async (req, res) => {
  const url = req.body.url.split("&")[0];
  const { sessionId, title = 'video', id } = req.body;
  const sockets = req.app.get("sockets");
  const socket = sockets.get(sessionId);

  if (!socket) return res.status(400).send('Invalid session ID, reload the page and try again.');
  if (socket) socket.emit("initializing", { message: { id } });

  if (incorrectUrl(url)) return res.status(400).send('Invalid URL: ' + url);

  try {
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
          socket.emit("status", { message: { id, progress: progress.percentage } });
        },
      }
    );

    socket.emit("dlfinished", { message: { id } });
    const stream = Readable.from(file.stream());

    ffmpeg(stream).noVideo().format('mp3').on("error", (err) => {
      res.status(500).send('Error processing video: ' + err.message);
    }).on("end", () => {
      socket.emit("finished", { message: { id } });
    }).pipe(res, { end: true });
  } catch (error) {
    res.status(500).send('Internal Server Error: ' + error);
  }
});

export default router;
