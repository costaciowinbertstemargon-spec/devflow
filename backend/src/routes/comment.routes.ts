import { Router } from "express";
import { createCommentController } from "../controllers/comment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post(
    "/tasks/:taskId/comments",
    authenticate,
    createCommentController 
);

export default router;