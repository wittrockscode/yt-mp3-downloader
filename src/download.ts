import express from 'express';
import { YtDlp } from 'ytdlp-nodejs';


const router = express.Router();
const ytdlp = new YtDlp();

const incorrectUrl = (url: string) => {
  const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return !urlPattern.test(url);
};

router.post('/', async (req, res) => {
  const url = req.body.url.split("&")[0];
  const { sessionId } = req.body;
  const sockets = req.app.get("sockets");
  const socket = sockets.get(sessionId);

  if (socket) socket.emit("initializing", { message: true });
  
  try {
    if (incorrectUrl(url)) return res.status(400).send('Invalid URL: ' + url);

    const title = await ytdlp.getTitleAsync(url);
    socket.emit("title", { message: title });

    const file = await ytdlp.getFileAsync(
      url,
      {
        format: {
          filter: 'audioonly',
          type: 'mp3',
          quality: 10,
        },
        filename: `${title}.mp3`,
        onProgress: (progress) => {
          socket.emit("status", { message: progress.percentage });
        },
      }
    );

    const buffer = await file.arrayBuffer();
    const nodeBuffer = Buffer.from(buffer);

    socket.emit("finished", { message: true });

    res.setHeader('Content-Type', file.type || 'application/octet-stream');
    res.send(nodeBuffer);
  } catch (error) {
    res.status(500).send('Internal Server Error: ' + error);
  }
});

export default router;
