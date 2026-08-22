import { Router } from "express";
import { createOrganizationController, addMember } from "../controllers/organization.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post(
    "/",
    authenticate,
    createOrganizationController
);

router.post(
    "/:organizationId/members",
    authenticate,
    addMember
)

export default router;