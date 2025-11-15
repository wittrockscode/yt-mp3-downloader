import express from "express";
import { Readable } from "stream";
import fs from 'fs';
import archiver from 'archiver';
import { ytdlp, ffmpeg, incorrectUrl } from "./misc";

const router = express.Router();

router.post('/', async (req, res) => {
  const { sessionId, title = 'playlist', id, items } = req.body;
  const sockets = req.app.get("sockets");
  const socket = sockets.get(sessionId);
   const dir = `./${sessionId}-${id}`;

  if (!socket) return res.status(400).send('Invalid session ID, reload the page and try again.');
  if (!items || !Array.isArray(items) || items.length === 0)
    return res.status(400).send('Playlist is empty or invalid.');
  if (socket) socket.emit("playlist_initializing", { message: { id } });
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  try {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (incorrectUrl(item.url)) continue;

      await ytdlp.downloadAsync(item.url, {
        format: {
          filter: 'audioandvideo',
          type: 'mp4',
          quality: 'highest',
        },
        output: `${dir}/${item.title}.mp4`,
        onProgress: (progress) => {
          socket.emit("playlist_status", {
            message: {
              id,
              progress: ((i / items.length) + (1 / items.length) * (progress.percentage / 100)) * 100,
            }
          });
        },
      });
    }
  } catch (error) {
    res.status(500).send('Internal Server Error: ' + error);
  }

  socket.emit("playlist_dlfinished", { message: { id } });

  const files = fs.readdirSync(dir);

  const promises = [];

  for (let i = 0; i < files.length; i++) {
    const filePath = `${dir}/${files[i]}`;

    promises.push(new Promise((resolve, reject) => {
       ffmpeg(filePath).noVideo().format('mp3').on("error", (err) => {
        console.error('Error processing video: ' + err.message);
      }).save(`${dir}/${files[i].replace('.mp4', '.mp3')}`).on("end", () => {
        fs.unlinkSync(filePath);
        resolve(true);
      }).on("error", (err) => {
        reject(err);
      });
    }));
  }

  await Promise.all(promises);

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.directory(dir, false);

  socket.emit("playlist_finished", { message: { id } });

  res.attachment(`${title}.zip`);
  archive.pipe(res);
  archive.finalize();

  archive.on('finish', () => {
    fs.rmSync(dir, { recursive: true, force: true });
  });
});

export default router;