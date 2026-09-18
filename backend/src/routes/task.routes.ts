import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middware.js";
import { createTaskSchema, updateTaskSchema } from "../schemas/task.schema.js";
import {
    createTaskController,
    updateTaskController,
    getProjectTasksController,
    getTaskController,
    getMyTasksController,
} from "../controllers/task.controller.js";

const router = Router();

router.post(
    "/projects/:projectId/tasks",
    authenticate,
    validateBody(createTaskSchema),
    createTaskController
);

router.get(
    "/tasks/my",
    authenticate,
    getMyTasksController
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