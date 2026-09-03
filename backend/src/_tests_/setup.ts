import { createServer } from "node:http";
import { Server } from "socket.io";
import { beforeAll, afterAll } from "vitest";
import { initializeSocket } from "../config/socket.js";
import http from "../app.js";

const httpServer = createServer(http);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

beforeAll(() => {
  initializeSocket(io);
});

afterAll(async () => {
  await io.close();
  httpServer.close();
});