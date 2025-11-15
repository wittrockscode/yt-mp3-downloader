import express from "express";
import { Readable } from "stream";
import fs from 'fs';
import archiver from 'archiver';
import sanitize from "sanitize-filename";
import { ytdlp, ffmpeg, incorrectUrl } from "./misc";

const router = express.Router();

router.post("/dl", async (req, res) => {
  const { sessionId, id, title = 'playlist' } = req.body;
  const sockets = req.app.get("sockets");
  const socket = sockets.get(sessionId);
  const dir = `./${sessionId}-${id}`;

  if (!socket) return res.status(400).send('Invalid session ID, reload the page and try again.');

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.directory(dir, false);

  socket.emit("playlist_finished", { message: { id } });

  res.attachment(`${sanitize(title)}.zip`);
  archive.pipe(res);
  archive.finalize();

  archive.on('finish', () => {
    fs.rmSync(dir, { recursive: true, force: true });
  });
});

router.post('/', async (req, res) => {
  const { sessionId, id, items } = req.body;
  const sockets = req.app.get("sockets");
  const socket = sockets.get(sessionId);
  const dir = `./${sessionId}-${id}`;

  if (!socket) return res.status(400).send('Invalid session ID, reload the page and try again.');
  if (!items || !Array.isArray(items) || items.length === 0)
    return res.status(400).send('Playlist is empty or invalid.');
  if (socket) socket.emit("playlist_initializing", { message: { id } });

  res.status(200).json({ status: 'Download started' });

  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  let promises = [];
  let progress = 0;

  try {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.title = sanitize(item.title);
      if (incorrectUrl(item.url)) continue;

      let lastPercentage = 0;
      const itemRatio = 1 / items.length;

      const promise = new Promise(async (resolve, reject) => {
        const filePath = `${dir}/${item.title}.mp4`;
        ytdlp.downloadAsync(item.url, {
          format: {
            filter: 'audioandvideo',
            type: 'mp4',
            quality: 'highest',
          },
          output: filePath,
          onProgress: (prog) => {
            const diff = prog.percentage - lastPercentage;
            lastPercentage = prog.percentage;
            const itemProgress = diff / 2 / 100 * itemRatio;
            progress += itemProgress;
            socket.emit("playlist_status", {
              message: {
                id,
                progress: Math.min(100, (progress + itemProgress) * 100),
              }
            });
          }
        }).then(() => {
          ffmpeg(filePath).noVideo().format('mp3').on("error", (err) => {
            socket.emit("playlist_error", { message: { id, error: err.message } });
            reject(err);
          }).save(`${filePath.replace('.mp4', '.mp3')}`).on("end", () => {
            fs.unlink(filePath, (err) => {
              if (err) {
                socket.emit("playlist_error", { message: { id, error: err.message } });
                reject(err);
                return;
              }
              progress += 0.5 * itemRatio;
              socket.emit("playlist_status", {
                message: {
                  id,
                  progress: Math.min(100, (progress) * 100),
                }
              });
              resolve(true);
            });
          }).on("error", (err) => {
            socket.emit("playlist_error", { message: { id, error: err.message } });
            reject(err);
          });
        }).catch((error) => {
          socket.emit("playlist_error", { message: { id, error: error.message } });
          reject(error);
        });
      });

      promises.push(promise);
    }
  } catch (error) {
    socket.emit("playlist_error", { message: { id, error } });
  }

  await Promise.all(promises);
  socket.emit("playlist_dl_ready", { message: { id } });

  setTimeout(() => {
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  }, 120000);
});

export default router;