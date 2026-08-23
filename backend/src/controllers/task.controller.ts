import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { createTask, updateTask, getProjectTasks, getTaskById } from "../services/task.service.js";
import type { GetTasksFilter } from "../services/task.service.js";

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

        if (!title || typeof title !== "string") {
            return res.status(400).json({
                status: "error",
                message: "Task title is required",
            });
        }

        const validPriorities = [
            "LOW",
            "MEDIUM",
            "HIGH",
            "URGENT",
        ];
        
        if (
            priority !== undefined &&
            !validPriorities.includes(priority)
        ) {
            return res.status(400).json({
                status: "error",
                message: "Invalid task priotity",
            });
        }

        if (
            dueDate !== undefined &&
            Number.isNaN(Date.parse(dueDate))
        ) {
            return res.status(400).json({
                status: "error",
                message: "Invalid due date"
            });
        }

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

        return res.status(200).json({
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
            return res.status(400).json({
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

        if(typeof taskId !== "string") {
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
            createdAt, 
            assigneeId,
        } = req.body;

        const validStatuses = [
            "TODO",
            "IN_PROGRESS",
            "REVIEW",
            "DONE",
        ];

            const validPriorities = [
            "LOW",
            "MEDIUM",
            "HIGH",
            "URGENT",
        ];

        if (
            status !== undefined &&
            !validStatuses.includes(status)
        ) {
            return res.status(400).json({
                status: "error",
                message: "Invalid task status",
            });
        }

        if (
            priority !== undefined &&
            !validPriorities.includes(priority)
        ) {
            return res.status(400).json({
                status: "error",
                message: "Invalid task priority",
            });
        }

        if (
            title !== undefined &&
            typeof title !== "string"
        ) {
            return res.status(400).json({
                status: "error",
                message: "Invalid task title",
            });
        }

        if (
            dueDate !== undefined &&
            dueDate !== null &&
            (
                typeof dueDate !== "string" ||
                Number.isNaN(Date.parse(dueDate))
            )
        ) {
            return res.status(400).json({
                status: "error",
                message: "Invalid due date"
            });
        }

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
            error.message === "You are not a member of this organization"
        ) {
            return res.status(403).json({
                status: "error",
                message: error.message
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
            error.message === "Assignee is not a member of the project organization"
        ) {
            return res.status(400).json({
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