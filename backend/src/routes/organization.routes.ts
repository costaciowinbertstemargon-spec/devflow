import { Router } from "express";
import { createOrganizationController, addMember, getOrganization } from "../controllers/organization.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireOrganizationRole } from "../middleware/organization.middleware.js";
import { validateBody } from "../middleware/validate.middware.js";
import { createOrganizationSchema, addMemberSchema } from "../schemas/organization.schema.js";

const router = Router();

router.post(
    "/",
    authenticate,
    validateBody(createOrganizationSchema),
    createOrganizationController
);

router.get(
    "/:organizationId",
    authenticate,
    requireOrganizationRole(["OWNER", "ADMIN", "MEMBER"]),
    getOrganization
)

router.post(
    "/:organizationId/members",
    authenticate,
    requireOrganizationRole(["OWNER", "ADMIN"]),
    validateBody(addMemberSchema),
    addMember
)

export default router;