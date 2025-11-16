import express from "express";
import { incorrectUrl, getYtDlpPath, ytdlpConfig } from "./misc";
import { spawn } from "child_process";
import fs from 'fs';
import sanitize from "sanitize-filename";

const router = express.Router();
const ytldpPath = getYtDlpPath();

router.post("/dl", async (req, res) => {
  const { sessionId, id, title = 'video', format } = req.body;
  const sockets = req.app.get("sockets");
  const socket = sockets.get(sessionId);
  const dir = `./downloads/${sessionId}-${id}`;

  if (!socket) return res.status(400).send('Invalid session ID, reload the page and try again.');

  const stream = fs.createReadStream(dir + `/${sanitize(title)}.${format}`);
  stream.pipe(res);

  stream.on('close', () => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  stream.on('error', (err) => {
    res.status(500).send('Internal Server Error: ' + err.message);
  });
});

router.post('/', async (req, res) => {
  const url = req.body.url.split("&")[0];
  const { sessionId, title = 'video', id, format } = req.body;
  const sockets = req.app.get("sockets");
  const socket = sockets.get(sessionId);

  if (!socket) return res.status(400).send('Invalid session ID, reload the page and try again.');
  if (socket) socket.emit("initializing", { message: { id } });

  if (incorrectUrl(url)) return res.status(400).send('Invalid URL: ' + url);

  try {
    res.status(200).json({ status: 'Download started' });

    const outDir = `downloads/${sessionId}-${id}`;

    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const config = ytdlpConfig(url, format, outDir, title);
    const proc = spawn(ytldpPath, config);

    proc.on("error", (err: any) => {
      socket.emit("error", { message: { id, error: err.message } });
    });

    proc.stdout.on("data", (chunk: any) => {
      const line = chunk.toString();
      const match = line.match(/^\s*([\d.]+)%\s+([\d.]+\w+)\s+([\d.]+\w+\/s)\s+([\d:]+)/);
      if (match) {
        const percent = parseFloat(match[1]);
        socket.emit("status", { message: { id, progress: percent } });

        if (percent >= 100) {
          socket.emit("dlfinished", { message: { id } });
        }
      }
    });

    proc.on("close", () => {
      socket.emit("dl_ready", { message: { id } });
    });

    setTimeout(() => {
      if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true });
    }, 60*60*1000);
  } catch (error) {
    res.status(500).send('Internal Server Error: ' + error);
  }
});

export default router;
