import { Router } from "express";
import { createProjectController } from "../controllers/project.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireOrganizationRole } from "../middleware/organization.middleware.js";

const router = Router();

router.post(
    "/organizations/:organizationId/projects",
    authenticate,
    requireOrganizationRole(["OWNER", "ADMIN"]),
    createProjectController
);

export default router;