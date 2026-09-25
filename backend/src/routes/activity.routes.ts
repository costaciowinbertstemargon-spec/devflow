import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getTaskActivities, getOrganizationActivitiesController } from "../controllers/activity.controller.js";

const router = Router();

router.get(
    "/tasks/:taskId/activities",
    authenticate,
    getTaskActivities
);

router.get(
    "/organizations/:organizationId/activities",
    authenticate,
    getOrganizationActivitiesController
)

export default router;