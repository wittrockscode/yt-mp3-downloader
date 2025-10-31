import express from "express";
import { ytdlp, incorrectUrl } from "./misc";
const router = express.Router();

router.get('/', async (req, res) => {
  const url = (req.query.url ? (req.query.url as string) : '').split("&")[0];
  if (incorrectUrl(url))
    return res.status(400).send('Invalid URL: ' + url);

  try {
    const info = await ytdlp.getInfoAsync(url as string);
    res.json(info);
  } catch (e) {
    return res.status(400).send('Error fetching video data for url: ' + url);
  }
});

export default router;
