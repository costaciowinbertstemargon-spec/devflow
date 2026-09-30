import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import type { GetTasksFilter } from "../services/task.service.js";
import {
    createTask,
    updateTask,
    getProjectTasks,
    getTaskById,
    getMyTasks,
    getTaskMembers,
    addTaskMember,
    removeTaskMember,
    archiveTask,
    restoreTask,
    getArchivedProjectTasks,
} from "../services/task.service.js";

export async function createTaskController(
    req: AuthenticatedRequest,
    res: Response    
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                status: "error",
                message: "Authentication required",
            })
        }

        const projectId = req.params.projectId;

        if (typeof projectId !== "string") {
            return res.status(400).json({
                status: "error",
                message: "Invalid project ID",
            });
        }

        const {
            title, 
            description, 
            priority, 
            dueDate, 
            createdAt, 
            assigneeId,
        } = req.body;

        const task = await createTask(
            projectId,
            req.user.userId,
            {
                title,
                description,
                priority,
                dueDate,
                assigneeId,
            }
        );

        return res.status(201).json({
            status: "success",
            message: "Task created successfully",
            task,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "Project not found"
        ) {
            return res.status(404).json({
                status: "error",
                message: error.message,
            });
        }

        if (
            error instanceof Error &&
            error.message === "Assignee is not a member of the project organization"
        ) {
            return res.status(403).json({
                status: "error",
                message: error.message,
            });
        }

        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Failed to create task",
        });
    }
}

export async function updateTaskController(
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

        const {
            title,
            description,
            status,
            priority,
            dueDate,
            assigneeId,
        } = req.body;

        const task = await updateTask(
            taskId,
            req.user.userId,
            {
                title,
                description,
                status,
                priority,
                dueDate,
                assigneeId,
            }
        );

        return res.status(200).json({
            status: "success",
            message: "Task updated successfully",
            task,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "Task not found"
        ) {
            return res.status(404).json({
                status: "error",
                message: error.message,
            });
        }

        if (
            error instanceof Error &&
            error.message ===
                "You are not a member of this organization"
        ) {
            return res.status(403).json({
                status: "error",
                message: error.message,
            });
        }

        if (
            error instanceof Error &&
            error.message === "Assignee not found"
        ) {
            return res.status(404).json({
                status: "error",
                message: error.message,
            });
        }

        if (
            error instanceof Error &&
            error.message ===
                "Assignee is not a member of the project organization"
        ) {
            return res.status(403).json({
                status: "error",
                message: error.message,
            });
        }

        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Failed to update task",
        });
    }
}

export async function getProjectTasksController(
    req: AuthenticatedRequest,
    res: Response    
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                status: "error",
                message: "Authentication required"
            });
        }

        const projectId = req.params.projectId;

        if (typeof projectId !== "string") {
            return res.status(400).json({
                status: "error",
                message: "Invalid project ID",
            });
        }

        const { status, priority, assigneeId } = req.query;

        const validStatues = [
            "TODO",
            "IN_PROGRESS",
            "REVIEW",
            "DONE",
        ] as const;

        const validPriorities = [
            "LOW",
            "MEDIUM",
            "HIGH",
            "URGENT",
        ] as const;

        if (
            status !== undefined && 
            (
                typeof status !== "string" ||
                !validStatues.includes(
                    status as typeof validStatues[number]
                )
            )
        ) {
            return res.status(400).json({
                status: "error",
                message: "Invalid task status",
            });
        }

        if (
            priority !== undefined &&
            (
                typeof priority !== "string" ||
                !validPriorities.includes(
                    priority as typeof validPriorities[number]
                )
            )
        ) {
            return res.status(400).json({
                status: "error",
                message: "Invalid task priority",
            });
        }

        if (
            assigneeId !== undefined &&
            typeof assigneeId !== "string"
        ) {
            return res.status(400).json({
                status: "error",
                message: "Invalid assignee ID",
            });
        }

        const filters: GetTasksFilter = {};

        if (typeof status === "string") {
            filters.status = status as NonNullable<GetTasksFilter["status"]>;
        }

        if (typeof priority === "string") {
            filters.priority = priority as NonNullable<GetTasksFilter["priority"]>;
        }

        if (typeof assigneeId === "string") {
            filters.assigneeId = assigneeId;
        }

        const tasks = await getProjectTasks(
            projectId,
            req.user.userId,
            filters
        );

        return res.status(200).json({
            status: "success",
            tasks,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "Project not found"
        ) {
            return res.status(404).json({
                status: "error",
                message: error.message,
            });
        }

        if (
            error instanceof Error &&
            error.message ===
                "You are not a member of this organization"
        ) {
            return res.status(403).json({
                status: "error",
                message: error.message,
            });
        }

        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Failed to retrieve tasks",
        });
    }
}

export async function getMyTasksController(
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

        const tasks = await getMyTasks(
            req.user.userId
        );

        return res.status(200).json({
            status: "success",
            tasks,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Failed to retrieve your tasks",
        });
    }
}

export async function getTaskController(
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

        const task = await getTaskById(
            taskId,
            req.user.userId
        );

        return res.status(200).json({
            status: "success",
            task,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "Task not found"
        ) {
            return res.status(404).json({
                status: "error",
                message: error.message,
            });
        }

        if (
            error instanceof Error &&
            error.message ===
                "You are not a member of this organization"
        ) {
            return res.status(403).json({
                status: "error",
                message: error.message,
            });
        }

        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Failed to retrieve task",
        });
    }
}

export async function getTaskMembersController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        const taskId = req.params.taskId;

        if (typeof taskId !== "string") {
            return res.status(400).json({
                status: "error",
                message: "Invalid task ID",
            });
        }

        if (!req.user) {
            return res.status(401).json({
                status: "error",
                message: "Authentication required",
            });
        }

        const members = await getTaskMembers(
            taskId,
            req.user.userId
        );

        return res.status(200).json({
            members,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to get task members";

        return res.status(400).json({
            message,
        });
    }
}

export async function addTaskMemberController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        const taskId = req.params.taskId;

        if (typeof taskId !== "string") {
            return res.status(400).json({
                status: "error",
                message: "Invalid task ID",
            });
        }

        const { userId: memberUserId } = req.body;

        if (!req.user) {
            return res.status(401).json({
                status: "error",
                message: "Authentication required",
            });
        }

        const member =
            await addTaskMember(
                taskId,
                memberUserId,
                req.user.userId
            );

        return res.status(201).json({
            member,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to add task member";

        return res.status(400).json({
            message,
        });
    }
}

export async function removeTaskMemberController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        const taskId = req.params.taskId;
        const memberUserId = req.params.userId;

        if (
            typeof taskId !== "string" ||
            typeof memberUserId !== "string"
        ) {
            return res.status(400).json({
                status: "error",
                message: "Invalid task or user ID",
            });
        }

        if (!req.user) {
            return res.status(401).json({
                status: "error",
                message: "Authentication required",
            });
        }

        await removeTaskMember(
            taskId,
            memberUserId,
            req.user.userId
        );

        return res.status(200).json({
            message: "Task member removed successfully",
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to remove task member";

        return res.status(400).json({
            message,
        });
    }
}

export async function archiveTaskController(
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

        const task = await archiveTask(
            taskId,
            req.user.userId
        );

        return res.status(200).json({
            status: "success",
            message: "Task archived successfully",
            task,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "Task not found") {
                return res.status(404).json({
                    status: "error",
                    message: error.message,
                });
            }

            if (
                error.message ===
                    "You are not a member of this organization" ||
                error.message.includes(
                    "permission to archive"
                )
            ) {
                return res.status(403).json({
                    status: "error",
                    message: error.message,
                });
            }

            if (
                error.message ===
                "Task is already archived"
            ) {
                return res.status(400).json({
                    status: "error",
                    message: error.message,
                });
            }
        }

        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Failed to archive task",
        });
    }
}

export async function restoreTaskController(
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

        const task = await restoreTask(
            taskId,
            req.user.userId
        );

        return res.status(200).json({
            status: "success",
            message: "Task restored successfully",
            task,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "Task not found") {
                return res.status(404).json({
                    status: "error",
                    message: error.message,
                });
            }

            if (
                error.message ===
                    "You are not a member of this organization" ||
                error.message.includes(
                    "permission to restore"
                )
            ) {
                return res.status(403).json({
                    status: "error",
                    message: error.message,
                });
            }

            if (
                error.message ===
                "Task is not archived"
            ) {
                return res.status(400).json({
                    status: "error",
                    message: error.message,
                });
            }
        }

        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Failed to restore task",
        });
    }
}

export async function getArchivedProjectTasksController(
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

        const projectId = req.params.projectId;

        if (typeof projectId !== "string") {
            return res.status(400).json({
                status: "error",
                message: "Invalid project ID",
            });
        }

        const tasks =
            await getArchivedProjectTasks(
                projectId,
                req.user.userId
            );

        return res.status(200).json({
            status: "success",
            tasks,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (
                error.message === "Project not found"
            ) {
                return res.status(404).json({
                    status: "error",
                    message: error.message,
                });
            }

            if (
                error.message.includes(
                    "permission to view archived"
                ) ||
                error.message ===
                    "You are not a member of this organization"
            ) {
                return res.status(403).json({
                    status: "error",
                    message: error.message,
                });
            }
        }

        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Failed to retrieve archived tasks",
        });
    }
}