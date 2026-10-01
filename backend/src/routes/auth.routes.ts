import { Router } from "express";
import { register, login, getMe, updateMe } from "../controllers/auth.controller.js";
import rateLimit from "express-rate-limit";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middware.js";
import { loginSchema, registerSchema, updateProfileSchema } from "../schemas/auth.schema.js";

const router = Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: process.env.NODE_ENV === "test" ? 1000 : 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many authentication attempts. Please try again later.",
    },
});


router.post(
    "/register",
    authLimiter, 
    validateBody(registerSchema),
    register
);

router.post(
    "/login", 
    authLimiter,
    validateBody(loginSchema),
    login
);

router.get(
    "/me", 
    authenticate, 
    getMe
);

router.patch(
    "/me",
    authenticate,
    validateBody(updateProfileSchema),
    updateMe
);

export default router;