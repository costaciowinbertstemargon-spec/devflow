import { Router } from "express";
import { createCommentController, getTaskCommentsController } from "../controllers/comment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middware.js";
import { createCommentSchema } from "../schemas/comment.schema.js";

const router = Router();

router.post(
    "/tasks/:taskId/comments",
    authenticate,
    validateBody(createCommentSchema),
    createCommentController 
);

router.get(
    "/tasks/:taskId/comments",
    authenticate,
    getTaskCommentsController
);

export default router;