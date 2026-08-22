import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { createOrganization } from "../services/organization.service.js";
import { addOrganizationMember } from "../services/organization_member.service.js";

export async function createOrganizationController(
    req: AuthenticatedRequest,
    res: Response,    
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                status: "error",
                message: "Authentication required",
            });
        }

        const { name, description } = req.body

        if (!name || typeof name !== "string") {
            return res.status(400).json({
                status: "error",
                message: "Organization name is required",
            });
        }

        const organization = await createOrganization (
            {
                name,
                description,
            },
            req.user.userId
        );

        return res.status(201).json({
            status: "success",
            message: "Organization created successfully",
            organization,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Failed to create organization",
        });
    }
}

export async function addMember(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                status: "error",
                message: "Authentication required",
            });
        }

        const organizationId  = req.params.organizationId;

        if (typeof organizationId !== "string") {
            return res.status(400).json({
                status: "error",
                message: "Invalid organization ID",
            });
        }

        const { email, role } = req.body;

        if (!email || typeof email !== "string") {
            return res.status(400).json({
                status: "error",
                message: "Email is required",
            });
        }

        if (role !== "ADMIN" && role !== "MEMBER") {
            return res.status(400).json({
                status: "error",
                message: "Role must be ADMIN or MEMBER",
            });
        }

        const membership = await addOrganizationMember(
            organizationId,
            email,
            role
        );

        return res.status(201).json({
            status: "success",
            message: "Member added successfully",
            membership,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "User not found"
        ) {
            return res.status(404).json({
                status: "error",
                message: error.message,
            });
        }

        if (
            error instanceof Error &&
            error.message === "User is already a member"
        ) {
            return res.status(409).json({
                status: "error",
                message: error.message
            });
        }

        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Failed to add organization member",
        });
    }
}