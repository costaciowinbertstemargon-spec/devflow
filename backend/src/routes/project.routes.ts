import { Router } from "express";
import { createProjectController, getProjects, getProject } from "../controllers/project.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireOrganizationRole } from "../middleware/organization.middleware.js";
import { validateBody } from "../middleware/validate.middware.js";
import { createProjectSchema } from "../schemas/project.schema.js";

const router = Router();

router.post(
    "/organizations/:organizationId/projects",
    authenticate,
    requireOrganizationRole(["OWNER", "ADMIN"]),
    validateBody(createProjectSchema),
    createProjectController
);

router.get(
    "/organizations/:organizationId/projects",
    authenticate,
    requireOrganizationRole(["OWNER", "ADMIN"]),
    getProjects
);

router.get(
    "/projects/:projectId",
    authenticate,
    getProject
);

export default router;