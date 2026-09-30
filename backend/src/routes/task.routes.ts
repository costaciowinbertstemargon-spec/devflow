import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middware.js";
import {
    createTaskSchema,
    updateTaskSchema,
} from "../schemas/task.schema.js";
import {
    createTaskController,
    updateTaskController,
    getProjectTasksController,
    getTaskController,
    getMyTasksController,
    getTaskMembersController,
    addTaskMemberController,
    removeTaskMemberController,
    getArchivedProjectTasksController,
    archiveTaskController,
    restoreTaskController,
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

router.get(
    "/tasks/:taskId/members",
    authenticate,
    getTaskMembersController
);

router.post(
    "/tasks/:taskId/members",
    authenticate,
    addTaskMemberController
);

router.delete(
    "/tasks/:taskId/members/:userId",
    authenticate,
    removeTaskMemberController
);

router.get(
    "/projects/:projectId/tasks/archived",
    authenticate,
    getArchivedProjectTasksController
);

router.post(
    "/tasks/:taskId/archive",
    authenticate,
    archiveTaskController
);

router.patch(
    "/tasks/:taskId/restore",
    authenticate,
    restoreTaskController
);

export default router;