import express from "express";
import { ytdlp, incorrectUrl } from "./misc";
const router = express.Router();

router.get('/', async (req, res) => {
  const url = (req.query.url ? (req.query.url as string) : '');
  if (incorrectUrl(url))
    return res.status(400).json('Invalid URL: ' + url);

  try {
    const info = await ytdlp.getInfoAsync(url as string, { flatPlaylist: true });
    res.json(info);
  } catch (e) {
    return res.status(400).json('Error fetching video data for url: ' + url);
  }
});

export default router;
