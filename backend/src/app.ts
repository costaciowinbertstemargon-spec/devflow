import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { prisma } from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
import organizationRoutes from "./routes/organization.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

const app = express();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: process.env.NODE_ENV === "test" ? 1000 : 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many authentication attempts. Please try again later.",
    },
});

app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);
app.use(express.json());
app.use(helmet());
app.use("/api/auth", authLimiter, authRoutes);

app.use("/api/organizations", organizationRoutes);

app.use("/api", projectRoutes);

app.use("/api", taskRoutes);

app.use("/api", commentRoutes);

app.use("/api", activityRoutes);

app.use("/api", notificationRoutes);

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