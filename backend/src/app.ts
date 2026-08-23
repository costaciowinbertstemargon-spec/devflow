import express from "express";
import cors from "cors";
import { prisma } from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
import organizationRoutes from "./routes/organization.routes.js";
import projectRoutes from "./routes/project.routes.js"
import taskRoutes from "./routes/task.routes.js"

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/organizations", organizationRoutes);

app.use("/api", projectRoutes);

app.use("/api", taskRoutes);

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