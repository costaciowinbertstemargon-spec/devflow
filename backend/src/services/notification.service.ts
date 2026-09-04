import { prisma } from "../config/database.js";
import { getIO } from "../config/socket.js";

interface CreateNotificationInput {
    userId: string;
    type:
        | "TASK_ASSIGNED"
        | "COMMENT_ADDED"
        | "STATUS_CHANGED"
        | "MENTION";
    message: string;
    taskId?: string;
}

export async function createNotification(
    input: CreateNotificationInput
) {
    const targetUser = await prisma.user.findUnique({
        where: {
            id: input.userId,
        },
        select: {
            id: true,
            name: true,
            email: true,
        },
    });

    if (!targetUser) {
        throw new Error("Notification target user does not exist");
    }

    const notification = await prisma.notification.create({
        data: {
            userId: targetUser.id,
            type: input.type,
            message: input.message,
            ...(input.taskId !== undefined && {
                taskId: input.taskId,
            }),
        },
    });

    const io = getIO();

    io.to(`user:${notification.userId}`).emit(
        "notification:new",
        {
            notification,
        }
    );

    return notification;
}

export async function markNotificationAsRead(
    notificationId: string,
    userId: string
) {
    const notification = await prisma.notification.findFirst({
        where: {
            id: notificationId,
            userId,
        },
    });
    
    if (!notification) {
        throw new Error ("Notification not found");
    }

    return prisma.notification.update({
        where: {
            id: notificationId,
        },
        data: {
            isRead: true,
        },
    });
}

export async function markAllNotificationsAsRead(
    userId: string 
) {
    return prisma.notification.updateMany({
        where: {
            userId,
            isRead: false,
        },
        data: {
            isRead: true,
        },
    });
}