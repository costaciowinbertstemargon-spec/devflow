import { prisma } from "../config/database.js";

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

    console.log("NOTIFICATION INPUT:", input);
    console.log("NOTIFICATION TARGET USER:", targetUser);

    if (!targetUser) {
        throw new Error("Notification target user does not exist");
    }

    return prisma.notification.create({
        data: {
            userId: targetUser.id,
            type: input.type,
            message: input.message,
            ...(input.taskId !== undefined && {
                taskId: input.taskId,
            }),
        },
    });
}