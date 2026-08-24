import { prisma } from "../config/database.js";

interface CreateCommentInput {
    content: string;
}

export async function createComment(
    taskId: string,
    userId: string,
    input: CreateCommentInput,
) {
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
        throw new Error("Task not found");
    }

    const membership = 
        await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId: task.project.organizationId,
                },
            },
        });

    if (!membership) {
        throw new Error(
            "You are not a member of this organization"
        );
    }

    const comment = await prisma.comment.create({
        data: {
            content: input.content,
            taskId,
            userId,
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

    await prisma.activity.create({
        data: {
            taskId,
            userId,
            action: "COMMENT_ADDED",
            metadata: {
                commentId: comment.id,
            },
        },
    });

    return comment;
}