import { prisma } from "../config/database.js";
import type { Prisma } from "../generated/prisma/client.js";

interface CreateActivityInput{
    taskId: string;
    userId: string,
    action:
        | "TASK_CREATED"
        | "TASK_UPDATED"
        | "TASK_ASSIGNED"
        | "STATUS_CHANGED"
        | "PRIORITY_CHANGED"
        | "COMMENT_ADDED";
    metadata?: Prisma.InputJsonValue;
}

export async function createActivity(
    input: CreateActivityInput
) {
    return prisma.activity.create({
        data: {
            taskId: input.taskId,
            userId: input.userId,
            action: input.action,
            ...(input.metadata !== undefined && {
                metadata: input.metadata,
            }),
        },
    });
}