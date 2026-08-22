import { Router } from "express";
import { createOrganizationController, addMember, getOrganization } from "../controllers/organization.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireOrganizationRole } from "../middleware/organization.middleware.js";

const router = Router();

router.post(
    "/",
    authenticate,
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
    addMember
)

export default router;