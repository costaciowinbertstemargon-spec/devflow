import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { prisma } from "../config/database.js";

export async function getTaskActivities(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                status: "error",
                message: "Authentication required",
            });
        }

        const taskId = req.params.taskId;

        if (typeof taskId !== "string") {
            return res.status(400).json({
                status: "error",
                message: "Invalid task ID",
            });
        }

        const task = await prisma.task.findUnique({
            where: {
                id: taskId,
            },
            include: {
                project: {
                    select: {
                        organizationId: true,
                    },
                },
            },
        });

        if (!task) {
            return res.status(404).json({
                status: "error",
                message: "Task not found",
            });
        }

        const membership =
            await prisma.organizationMember.findUnique({
                where: {
                    userId_organizationId: {
                        userId: req.user.userId,
                        organizationId: task.project.organizationId,
                    },
                },
            });

        if (!membership) {
            return res.status(403).json({
                status: "error",
                message: "You are not a member of this organization",
            });
        }

        const activities = await prisma.activity.findMany({
            where: {
                taskId,
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return res.status(200).json({
            status: "success",
            activities,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Failed to retrieve activity history",
        });
    }
}