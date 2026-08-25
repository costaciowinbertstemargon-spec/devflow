import type { Server } from "socket.io";

let io: Server | null = null;

export function initializeSocket(server: Server) {
    io = server;
}

export function getIO() {
    if (!io) {
        throw new Error("Soccket.IO has not been initialized");
    }

    return io;
}