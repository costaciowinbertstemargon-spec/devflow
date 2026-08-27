import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { createComment } from "../services/comment.service.js";

export async function createCommentController(
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

        const { content } = req.body;

        const comment = await createComment(
            taskId,
            req.user.userId,
            {
                content: content.trim(),
            }
        );

        return res.status(201).json({
            status: "success",
            message: "Comment created successfully",
            comment,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "Task not found"
        ) {
            return res.status(404).json({
                status: "error",
                message: error.message,
            })
        }

        if (
            error instanceof Error &&
            error.message === "You are not a member of this organization"
        ) {
            return res.status(403).json({
                status: "error",
                message: error.message,
            });
        }
        
        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Failed to create comment",
        });
        
    }
}