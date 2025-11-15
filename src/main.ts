import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import download_route from './download';
import download_playlist_route from './download_playlist';
import info_route from './info';
import http from 'http';
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const sockets = new Map();

io.on('connection', (socket) => {
  socket.on("register", (data) => {
    sockets.set(data, socket);
  });
});

app.set("sockets", sockets)

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3001;

app.use("/api/download", download_route);
app.use("/api/download_playlist", download_playlist_route);
app.use("/api/info", info_route);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});