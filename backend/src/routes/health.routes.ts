import { Router } from "express";
import { prisma } from "../config/database.js";

const router = Router();

router.get("/health", async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        return res.status(200).json({
            status: "success",
            message: "DevFlow API is healthy",          database: "connected",
        });
    } catch (error) {
        console.error("Health check failed:", error);

        return res.status(503).json({
            status: "error",
            message: "DevFlow API is unavailable",
            database: "disconnected",
        });
    }
});

export default router;