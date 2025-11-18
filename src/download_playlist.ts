import express from "express";
import { incorrectUrl, getYtDlpPath, ytdlpConfig, timeouts } from "./misc";
import { spawn } from "child_process";
import fs from 'fs';
import sanitize from "sanitize-filename";
import archiver from 'archiver';

const router = express.Router();

router.post("/dl", async (req, res) => {
  const { sessionId, id, title = 'playlist' } = req.body;
  const sockets = req.app.get("sockets");
  const socket = sockets.get(sessionId);
  const dir = `./downloads/${sessionId}-${id}`;

  if (!socket) return res.status(400).send('Invalid session ID, reload the page and try again.');

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.directory(dir, false);

  res.attachment(`${sanitize(title)}.zip`);
  archive.pipe(res);
  archive.finalize();

  archive.on('finish', () => {
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
    clearTimeout(timeouts.get(`${sessionId}-${id}`));
    timeouts.delete(`${sessionId}-${id}`);
  });
});

router.post('/', async (req, res) => {
  const { sessionId, id, items, format } = req.body;
  const sockets = req.app.get("sockets");
  const socket = sockets.get(sessionId);
  const dir = `./downloads/${sessionId}-${id}`;

  if (!socket) return res.status(400).send('Invalid session ID, reload the page and try again.');
  if (!items || !Array.isArray(items) || items.length === 0)
    return res.status(400).send('Playlist is empty or invalid.');
  if (socket) socket.emit("playlist_initializing", { message: { id } });

  res.status(200).json({ status: 'Download started' });

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let promises = [];
  let progress = 0;
  let lastEmittedProgress = 0;

  try {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.title = sanitize(item.title);
      if (incorrectUrl(item.url)) continue;

      promises.push(new Promise<void>((resolve, reject) => {
        const config = ytdlpConfig(item.url, format, dir, item.title);
        const proc = spawn(getYtDlpPath(), config);

        proc.on("error", (err: any) => {
          socket.emit("playlist_error", { message: { id, error: `Error downloading ${item.title}: ${err.message}` } });
          reject();
        });

        proc.stdout.on("data", (chunk: any) => {
          const line = chunk.toString();
          const match = line.match(/^\s*([\d.]+)%\s+([\d.]+\w+)\s+([\d.]+\w+\/s)\s+([\d:]+)/);

          if (match) {
            const percent = parseFloat(match[1]);
            const prog = (1 / items.length * (percent / 100)) * 100 + progress;
            if (prog - lastEmittedProgress >= 5 || prog >= 100) {
              lastEmittedProgress = prog;
              socket.emit("playlist_status", { message: { id, progress: prog } });
            }

            if (percent >= 100) progress += ((1 / items.length) * 100);
          }
        });

        proc.on("close", () => {
          resolve();
        });
      }));
    }
  } catch (error) {
    socket.emit("playlist_error", { message: { id, error } });
  }

  await Promise.all(promises);
  socket.emit("playlist_dl_ready", { message: { id } });

  timeouts.set(
    `${sessionId}-${id}`,
    setTimeout(() => {
      if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
    }, 60 * 60 * 1000)
  );
});

export default router;