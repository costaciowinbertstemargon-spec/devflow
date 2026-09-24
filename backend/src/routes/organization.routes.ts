import { Router } from "express";
import { createOrganizationController, addMember, getOrganization, getMyOrganizations, updateOrganizationController } from "../controllers/organization.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireOrganizationRole } from "../middleware/organization.middleware.js";
import { validateBody } from "../middleware/validate.middware.js";
import { createOrganizationSchema, addMemberSchema, updateOrganizationSchema } from "../schemas/organization.schema.js";

const router = Router();

router.post(
    "/",
    authenticate,
    validateBody(createOrganizationSchema),
    createOrganizationController
);

router.get(
    "/",
    authenticate,
    getMyOrganizations
);

router.get(
    "/:organizationId",
    authenticate,
    requireOrganizationRole(["OWNER", "ADMIN", "MEMBER"]),
    getOrganization
)

router.patch(
    "/:organizationId",
    authenticate,
    requireOrganizationRole(["OWNER", "ADMIN"]),
    validateBody(updateOrganizationSchema),
    updateOrganizationController
);

router.post(
    "/:organizationId/members",
    authenticate,
    requireOrganizationRole(["OWNER", "ADMIN"]),
    validateBody(addMemberSchema),
    addMember
)

export default router;