import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getTaskActivities } from "../controllers/activity.controller.js";

const router = Router();

router.get(
    "/tasks/:taskId/activities",
    authenticate,
    getTaskActivities
);

export default router;