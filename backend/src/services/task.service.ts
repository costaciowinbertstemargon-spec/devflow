import { prisma } from "../config/database.js";
import { createNotification } from "./notification.service.js";
import { getIO } from "../config/socket.js";

interface CreateTaskInput {
    title: string;
    description?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    dueDate?: string;
    assigneeId?: string;
}

interface UpdateTaskInput {
    title?: string;
    description?: string;
    status?: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    dueDate?: string | null;
    assigneeId?: string | null;
}

export interface GetTasksFilter {
    status?: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    assigneeId?: string;
}

export async function  createTask(
    projectId: string,
    userId: string,
    input: CreateTaskInput
) {
    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
    });

    if (!project) {
        throw new Error("Project not found");
    }

    if (input.assigneeId) {
        const assignee = await prisma.user.findUnique({
            where: {
                id: input.assigneeId,
            },
        });

        if (!assignee) {
            throw new Error("Assignee not found");
        }

        const membership =
            await prisma.organizationMember.findUnique({
                where: {
                    userId_organizationId: {
                        userId,
                        organizationId: project.organizationId,
                    },
                },
            });
        
        if (!membership) {
            throw new Error (
                "Assignee is not a member of the project organization"
            );
        }
    }

    const task = await prisma.task.create({
        data: {
            title: input.title,
            ...(input.description !== undefined && {
                description: input.description,
            }),
            projectId,
            ...(input.assigneeId !== undefined && {
                assigneeId: input.assigneeId,
            }),
            ...(input.priority !== undefined && {
                priority: input.priority,
            }),
            ...(input.dueDate !== undefined && {
                dueDate: new Date(input.dueDate),
            }),                     
        },
        include: {
            assignee: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            project: {
                select: {
                    id: true,
                    name: true,
                    organizationId: true,
                },
            },
        },
    });

    await prisma.activity.create({
        data: {
            taskId: task.id,
            userId,
            action: "TASK_CREATED",
        },
    });

    return task;
}

export async function updateTask(
    taskId: string,
    userId: string,
    input: UpdateTaskInput    
) {
    const existingTask = await prisma.task.findUnique({
        where: {
            id:taskId,
        },
        include: {
            project: {
                select: {
                    organizationId: true,
                },
            },
        },
    });

    if (!existingTask) {
        throw new Error("Task not found");
    }

    const membership = await prisma.organizationMember.findUnique({
        where: {
            userId_organizationId: {
                userId,
                organizationId: existingTask.project.organizationId,
            },
        },
    });

    if (!membership) {
        throw new Error("You are not a member of this organization");
    }

    if (input.assigneeId) {
        const assignee = await prisma.user.findUnique({
            where: {
                id: input.assigneeId,
            },
        });

        if (!assignee) {
            throw new Error("Assignee not found");
        }

        const assigneeMembership = 
            await prisma.organizationMember.findUnique({
                where: {
                    userId_organizationId: {
                        userId: input.assigneeId,
                        organizationId: existingTask.project.organizationId,
                    },
                },
            });
        
        if (!assigneeMembership) {
            throw new Error(
                "Assignee is not a member of the project organization"
            );
        }
    }

    const task = await prisma.task.update({
        where: {
            id: taskId,
        },
        data: {
            ...(input.title !== undefined && {
                title: input.title,
            }),

            ...(input.description !== undefined && {
                description: input.description,
            }),

            ...(input.status !== undefined && {
                status: input.status,
            }),
            
            ...(input.priority !== undefined && {
                priority: input.priority,
            }),            

            ...(input.dueDate !== undefined && {
                dueDate:
                    input.dueDate === null
                        ? null
                        : new Date(input.dueDate),
            }),

            ...(input.assigneeId !== undefined && {
                assigneeId: input.assigneeId,
            }),
        },
        include: {
            assignee: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            project: {
                select: {
                    id: true,
                    name: true,
                    organizationId: true,
                },
            },
        },
    });

    const io = getIO();

    io.to(`organization:${task.project.organizationId}`).emit(
        "task:updated",
        {
            task,
        }
    );
 
    if (
        input.status !== undefined &&
        input.status !== existingTask?.status
    ) {
        await prisma.activity.create({
            data: {
                taskId,
                userId,
                action: "STATUS_CHANGED",
                metadata: {
                    from: existingTask?.status,
                    to: input.status,
                },
            },
        });
    }

    if (
        input.priority !== undefined &&
        input.priority !== existingTask?.priority
    ) {
        await prisma.activity.create({
            data: {
                taskId,
                userId,
                action: "PRIORITY_CHANGED",
                metadata: {
                    from: existingTask?.priority,
                    to: input.priority,
                },
            },
        });
    }

    if (
        typeof input.assigneeId === "string" &&
        input.assigneeId !== existingTask.assigneeId
    ) {
        const assignedUserId = input.assigneeId;

        await prisma.activity.create({
            data: {
                taskId,
                userId,
                action: "TASK_ASSIGNED",
                metadata: {
                    from: existingTask.assigneeId,
                    to: assignedUserId,
                },
            },
        });

        await createNotification({
            userId: assignedUserId,
            type: "TASK_ASSIGNED",
            message: `You were assigned the task "${task.title}"`,
            taskId: task.id,
        });
    }

    const updatedFields: string[] = [];

    if (
        input.title !== undefined &&
        input.title !== existingTask.title
    ) {
        updatedFields.push("title");
    }

    if (
        input.description !== undefined &&
        input.description !== existingTask.description
    ) {
        updatedFields.push("description");
    }

    if (
        input.dueDate !== undefined
    ) {
        const oldDueDate = existingTask.dueDate
            ? existingTask.dueDate.toISOString()
            : null;

        if (input.dueDate !== oldDueDate) {
            updatedFields.push("dueDate");
        }
    }

    if (updatedFields.length > 0) {
        await prisma.activity.create({
            data: {
                taskId,
                userId,
                action: "TASK_UPDATED",
                metadata: {
                    updatedFields,
                },
            },
        });
    }

    return task;
}

export async function getProjectTasks(
    projectId: string,
    userId: string,
    filters: GetTasksFilter    
) {
    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
        select: {
            id: true,
            organizationId: true,
        },
    });

    if (!project) {
        throw new Error("project not found");
    }

    const membership =
        await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId: project.organizationId,
                },
            },
        });

    if (!membership) {
        throw new Error("You are not a member of this organization");
    }

    return prisma.task.findMany({
        where: {
            projectId,

            ...(filters.status !== undefined && {
                status: filters.status,
            }),

            ...(filters.priority !== undefined && {
                priority: filters.priority,
            }),

            ...(filters.assigneeId !== undefined && {
                assigneeId: filters.assigneeId,
            }),
        },

        orderBy: {
            createdAt: "desc",
        },

        include: {
            assignee: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
}

export async function getMyTasks(
    userId: string
) {
    return prisma.task.findMany({
        where: {
            assigneeId: userId,

            project: {
                organization: {
                    members: {
                        some: {
                            userId,
                        },
                    },
                },
            },
        },

        orderBy: {
            createdAt: "desc",
        },

        include: {
            assignee: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },

            project: {
                select: {
                    id: true,
                    name: true,
                    organizationId: true,
                },
            },
        },
    });
}

export async function getTaskById(
    taskId: string,
    userId: string    
) {
    const task = await prisma.task.findUnique({
        where: {
            id: taskId,
        },
        include: {
            project: {
                select: {
                    id: true,
                    name: true,
                    organizationId: true,
                },
            },
            assignee: {
                select: {
                    id: true,
                    name: true,
                    email: true,
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

    return task;
}

export async function getTaskMembers(
    taskId: string,
    userId: string
) {
    const task = await prisma.task.findUnique({
        where: {
            id: taskId,
        },
        select: {
            id: true,
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
                    organizationId:
                        task.project.organizationId,
                },
            },
        });

    if (!membership) {
        throw new Error(
            "You are not a member of this organization"
        );
    }

    return prisma.taskMember.findMany({
        where: {
            taskId,
            user: {
                memberships: {
                    some: {
                        organizationId:
                            task.project.organizationId,
                    },
                },
            },
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
        orderBy: {
            createdAt: "asc",
        },
    });
}

export async function addTaskMember(
    taskId: string,
    memberUserId: string,
    requesterId: string
) {
    const task = await prisma.task.findUnique({
        where: {
            id: taskId,
        },
        select: {
            id: true,
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

    const requesterMembership =
        await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId: requesterId,
                    organizationId:
                        task.project.organizationId,
                },
            },
        });

    if (!requesterMembership) {
        throw new Error(
            "You are not a member of this organization"
        );
    }

    const targetMembership =
        await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId: memberUserId,
                    organizationId:
                        task.project.organizationId,
                },
            },
        });

    if (!targetMembership) {
        throw new Error(
            "The selected user is not a member of this organization"
        );
    }

    const existingMember =
        await prisma.taskMember.findUnique({
            where: {
                taskId_userId: {
                    taskId,
                    userId: memberUserId,
                },
            },
        });

    if (existingMember) {
        throw new Error(
            "This user is already assigned to the task"
        );
    }

    return prisma.taskMember.create({
        data: {
            taskId,
            userId: memberUserId,
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
}

export async function removeTaskMember(
    taskId: string,
    memberUserId: string,
    requesterId: string
) {
    const task = await prisma.task.findUnique({
        where: {
            id: taskId,
        },
        select: {
            id: true,
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

    const requesterMembership =
        await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId: requesterId,
                    organizationId:
                        task.project.organizationId,
                },
            },
        });

    if (!requesterMembership) {
        throw new Error(
            "You are not a member of this organization"
        );
    }

    const taskMember =
        await prisma.taskMember.findUnique({
            where: {
                taskId_userId: {
                    taskId,
                    userId: memberUserId,
                },
            },
        });

    if (!taskMember) {
        throw new Error(
            "This user is not assigned to the task"
        );
    }

    return prisma.taskMember.delete({
        where: {
            id: taskMember.id,
        },
    });
}

export async function archiveTask(
    taskId: string,
    userId: string
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
                    organizationId:
                        task.project.organizationId,
                },
            },
        });

    if (!membership) {
        throw new Error(
            "You are not a member of this organization"
        );
    }

    if (
        membership.role !== "OWNER" &&
        membership.role !== "ADMIN"
    ) {
        throw new Error(
            "You do not have permission to archive this task"
        );
    }

    if (task.archivedAt) {
        throw new Error("Task is already archived");
    }

    const updatedTask = await prisma.task.update({
        where: {
            id: taskId,
        },
        data: {
            archivedAt: new Date(),
        },
        include: {
            assignee: {
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
            action: "TASK_ARCHIVED",
        },
    });

    return updatedTask;
}

export async function restoreTask(
    taskId: string,
    userId: string
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
                    organizationId:
                        task.project.organizationId,
                },
            },
        });

    if (!membership) {
        throw new Error(
            "You are not a member of this organization"
        );
    }

    if (
        membership.role !== "OWNER" &&
        membership.role !== "ADMIN"
    ) {
        throw new Error(
            "You do not have permission to restore this task"
        );
    }

    if (!task.archivedAt) {
        throw new Error("Task is not archived");
    }

    const updatedTask = await prisma.task.update({
        where: {
            id: taskId,
        },
        data: {
            archivedAt: null,
        },
        include: {
            assignee: {
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
            action: "TASK_RESTORED",
        },
    });

    return updatedTask;
}

export async function getArchivedProjectTasks(
    projectId: string,
    userId: string
) {
    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
        select: {
            organizationId: true,
        },
    });

    if (!project) {
        throw new Error("Project not found");
    }

    const membership =
        await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId:
                        project.organizationId,
                },
            },
        });

    if (!membership) {
        throw new Error(
            "You are not a member of this organization"
        );
    }

    if (
        membership.role !== "OWNER" &&
        membership.role !== "ADMIN"
    ) {
        throw new Error(
            "You do not have permission to view archived tasks"
        );
    }

    return prisma.task.findMany({
        where: {
            projectId,
            archivedAt: {
                not: null,
            },
        },
        orderBy: {
            archivedAt: "desc",
        },
        include: {
            assignee: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
}