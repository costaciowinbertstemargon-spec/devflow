import { Router } from "express";
import { createTaskController, updateTaskController, getProjectTasksController, getTaskController } from "../controllers/task.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post(
    "/projects/:projectId/tasks",
    authenticate,
    createTaskController
);

router.patch(
    "/tasks/:taskId",
    authenticate,
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