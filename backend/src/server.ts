import "dotenv/config";
import { createServer } from "node:http";
import { Server } from "socket.io";
import app from "./app.js";
import { initializeSocket } from "./config/socket.js";
import jwt from "jsonwebtoken";
import { prisma } from "./config/database.js";

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true,
    },
});

initializeSocket(io);

io.use((socket, next) => {
    try {
        const token = socket.handshake.auth?.token;

        if (!token || typeof token !== "string") {
            return next(new Error("Authentication required"));
        }

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            return next(new Error("JWT_SECRET is not configured"));
        }

        const payload = jwt.verify(token, secret);

        if(
            typeof payload !== "object" ||
            payload === null ||
            !("userId" in payload)
        ) {
            return next(new Error("Invalid token payload"));
        }

        socket.data.userId = payload.userId;

        next();
    } catch (error) {
        console.error("Socket authentication failed:", error);
        next(new Error("Invalid or expired token"));
    }
});

io.on("connection", (socket) => {
    const userId = socket.data.userId as string;

    socket.join(`user:${userId}`);

    console.log(
        `${socket.id} authenticated as user:${userId}`
    );

    console.log(`Socket connected: ${socket.id}`);

    socket.on("join:organization", 
        async (organizationId: string) => {
            try{
                const membership =
                    await prisma.organizationMember.findUnique({
                        where: {
                            userId_organizationId: {
                                userId,
                                organizationId,
                            },
                        },
                    });

                if (!membership) {
                    console.log (
                        `${socket.id} denied organization access`
                    );
                    return;
                }

                socket.join(
                    `organization:${organizationId}`
                );

                console.log(
                    `${socket.id} joined organization:${organizationId}`
                );
            } catch (error) {
                console.error(error);
            }
        }
    );

    socket.on(
        "leave:organization",
        (organizationId: string) => {
            socket.leave(`organization:${organizationId}`);

            console.log(
                `${socket.id} left organization:${organizationId}`
            );
        }
    );

    socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

httpServer.listen(PORT, () => {
    console.log(
        `DevFlow API running on http://localhost:${PORT}`
    );
});