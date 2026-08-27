import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middware.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";

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

export default router;