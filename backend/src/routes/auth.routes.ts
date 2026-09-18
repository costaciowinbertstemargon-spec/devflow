import { Router } from "express";
import { register, login, getMe, updateMe } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middware.js";
import { loginSchema, registerSchema, updateProfileSchema } from "../schemas/auth.schema.js";

const router = Router();

router.post(
    "/register", 
    validateBody(registerSchema),
    register
);

router.post(
    "/login", 
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