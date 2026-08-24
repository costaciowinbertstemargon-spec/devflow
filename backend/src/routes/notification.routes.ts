import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getNotifications } from "../controllers/notification.controller.js";

const router = Router();

router.get(
    "/notifications",
    authenticate,
    getNotifications
);

export default router;