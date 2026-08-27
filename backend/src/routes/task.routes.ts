import { Router } from "express";
import { createTaskController, updateTaskController, getProjectTasksController, getTaskController } from "../controllers/task.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middware.js";
import { createTaskSchema, updateTaskSchema } from "../schemas/task.schema.js";

const router = Router();

router.post(
    "/projects/:projectId/tasks",
    authenticate,
    validateBody(createTaskSchema),
    createTaskController
);

router.patch(
    "/tasks/:taskId",
    authenticate,
    validateBody(updateTaskSchema),
    updateTaskController
);

router.get(
    "/projects/:projectId/tasks",
    authenticate,
    getProjectTasksController
);

router.get(
    "/tasks/:taskId",
    authenticate,
    getTaskController
);

export default router