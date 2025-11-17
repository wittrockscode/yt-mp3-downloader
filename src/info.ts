import express from "express";
import { incorrectUrl, getYtDlpPath, ytdlpConfig } from "./misc";
import { spawn } from "child_process";
const router = express.Router();

const ytdlpPath = getYtDlpPath();

router.get('/', async (req, res) => {
  const url = (req.query.url ? (req.query.url as string) : '');
  if (incorrectUrl(url))
    return res.status(400).json('Invalid URL: ' + url);

  try {
    const proc = spawn(ytdlpPath, [
      "--flat-playlist",
      "--dump-single-json",
      url,
    ]);
    proc.on("error", (err: any) => {
      res.status(500).json('Internal server error: ' + err.message);
    });

    let json = "";

    proc.stdout.on("data", chunk => json += chunk.toString());

    proc.on("close", (code) => {
      if (code !== 0) {
        res.status(500).json('Internal server error: ' + code);
        return;
      }

      res.json(JSON.parse(json));
    });
  } catch (e) {
    return res.status(400).json('Error fetching video data for url: ' + url);
  }
});

export default router;
