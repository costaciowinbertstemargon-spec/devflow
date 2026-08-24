import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { prisma } from "../config/database.js";
import { markNotificationAsRead, markAllNotificationsAsRead } from "../services/notification.service.js";

export async function getNotifications(
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

        const notifications =
            await prisma.notification.findMany({
                where: {
                    userId: req.user.userId,
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 50,
                include: {
                    task: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                },
            });

        return res.status(200).json({
            status: "success",
            notifications,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Failed to retrieve notifications",
        });
    }
}

export async function markNotificationRead(
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

        const notificationId = req.params.notificationId;

        if (typeof notificationId !== "string") {
            return res.status(400).json({
                status: "error",
                message: "Invalid notification ID",
            });
        }

        const notification = await markNotificationAsRead(
            notificationId,
            req.user.userId
        );

        return res.status(200).json({
            status: "success",
            message: "Notification marked as read",
            notification,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "Notification not found"
        ) {
            return res.status(404).json({
                status: "error",
                message: error.message,
            });
        }

        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Failed to mark notification as read",
        });
    }
}

export async function markAllNotificationsRead(
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

        const result = await markAllNotificationsAsRead(
            req.user.userId
        );

        return res.status(200).json({
            status: "success",
            message: "All notifications marked as read",
            updatedCount: result.count,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Failed to mark notifications as read",
        });
    }
}