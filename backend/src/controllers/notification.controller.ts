import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { prisma } from "../config/database.js";

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