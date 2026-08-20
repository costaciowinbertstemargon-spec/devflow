import express from "express";
import cors from "cors";
import { prisma } from "./config/database.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", async (_req, res) => {
    try {
        await prisma.user.count();

        res.json({
            status: "ok",
            message: "DevFlow API and database are running",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: "error",
            message: "Database connection failed",
        });
    }
});

export default app;