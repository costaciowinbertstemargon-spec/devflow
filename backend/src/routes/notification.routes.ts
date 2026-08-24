import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../controllers/notification.controller.js";

const router = Router();

router.get(
    "/notifications",
    authenticate,
    getNotifications
);

router.patch(
    "/notifications/:notificationId/read",
    authenticate,
    markNotificationRead
);

router.patch(
    "/notifications/read-all",
    authenticate,
    markAllNotificationsRead
);

export default router;