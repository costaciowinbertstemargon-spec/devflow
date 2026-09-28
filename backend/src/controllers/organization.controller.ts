import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { createOrganization, getOrganizationById, getOrganizationsByUser, updateOrganization} from "../services/organization.service.js";
import { addOrganizationMember, updateOrganizationMemberRole, removeOrganizationMember, leaveOrganization } from "../services/organization_member.service.js";
import type { OrganizationRequest } from "../middleware/organization.middleware.js";
import { prisma } from "../config/database.js";

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

export async function getOrganization(
    req: OrganizationRequest,
    res:Response
) {
   try {
        if (!req.organization) {
            return res.status(403).json({
                status: "error",
                message: "Organization access required",
            });
        }

        const organization = await getOrganizationById(
            req.organization.id
        );

        if (!organization) {
            return res.status(404).json({
                status: "error",
                message: "Organization not found",
            });
        }

        return res.status(200).json({
            status: "success",
            organization
        });
   } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Failed to retrieve organization",
        });
   }
}

export async function updateOrganizationController(
    req: OrganizationRequest,
    res: Response
) {
    try {
        if (!req.organization) {
            return res.status(403).json({
                status: "error",
                message: "Organization access required",
            });
        }

        const { name, description } = req.body;

        const organization = await updateOrganization(
            req.organization.id,
            {
                name,
                description,
            }
        );

        return res.status(200).json({
            status: "success",
            message: "Organization updated successfully",
            organization,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Failed to update organization",
        });
    }
}

export async function getMyOrganizations(
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

        const organizations = await getOrganizationsByUser(
            req.user.userId
        );

        return res.status(200).json({
            status: "success",
            organizations,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Failed to retrieve organizations",
        });
    }
}

export async function updateMemberRole(
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

        const organizationId =
            req.params.organizationId;

        const memberId =
            req.params.memberId;

        if (
            typeof organizationId !== "string" ||
            typeof memberId !== "string"
        ) {
            return res.status(400).json({
                status: "error",
                message: "Invalid organization or member ID",
            });
        }

        const { role } = req.body;

        const requester =
            await prisma.organizationMember.findUnique({
                where: {
                    userId_organizationId: {
                        userId: req.user.userId,
                        organizationId,
                    },
                },
            });

        if (!requester) {
            return res.status(403).json({
                status: "error",
                message:
                    "You are not a member of this organization",
            });
        }

        if (requester.role !== "OWNER") {
            return res.status(403).json({
                status: "error",
                message:
                    "Only the organization owner can change member roles",
            });
        }

        const membership =
            await updateOrganizationMemberRole(
                organizationId,
                memberId,
                role
            );

        return res.status(200).json({
            status: "success",
            message:
                "Member role updated successfully",
            membership,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "Member not found"
        ) {
            return res.status(404).json({
                status: "error",
                message: error.message,
            });
        }

        if (
            error instanceof Error &&
            error.message ===
                "The organization owner role cannot be changed"
        ) {
            return res.status(403).json({
                status: "error",
                message: error.message,
            });
        }

        console.error(error);

        return res.status(500).json({
            status: "error",
            message:
                "Failed to update member role",
        });
    }
}

export async function removeMember(
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

        const organizationId =
            req.params.organizationId;

        const memberId =
            req.params.memberId;

        if (
            typeof organizationId !== "string" ||
            typeof memberId !== "string"
        ) {
            return res.status(400).json({
                status: "error",
                message: "Invalid organization or member ID",
            });
        }

        const requester =
            await prisma.organizationMember.findUnique({
                where: {
                    userId_organizationId: {
                        userId: req.user.userId,
                        organizationId,
                    },
                },
            });

        if (!requester) {
            return res.status(403).json({
                status: "error",
                message:
                    "You are not a member of this organization",
            });
        }

        const target =
            await prisma.organizationMember.findFirst({
                where: {
                    id: memberId,
                    organizationId,
                },
            });

        if (!target) {
            return res.status(404).json({
                status: "error",
                message: "Member not found",
            });
        }

        if (target.role === "OWNER") {
            return res.status(403).json({
                status: "error",
                message:
                    "The organization owner cannot be removed",
            });
        }

        if (
            requester.role === "ADMIN" &&
            target.role !== "MEMBER"
        ) {
            return res.status(403).json({
                status: "error",
                message:
                    "Admins can only remove members",
            });
        }

        if (
            requester.role !== "OWNER" &&
            requester.role !== "ADMIN"
        ) {
            return res.status(403).json({
                status: "403",
                message:
                    "You do not have permission to remove members",
            });
        }

        await removeOrganizationMember(
            organizationId,
            memberId
        );

        return res.status(200).json({
            status: "success",
            message: "Member removed successfully",
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: "error",
            message:
                "Failed to remove organization member",
        });
    }
}

export async function leaveOrganizationController(
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

        const organizationId =
            req.params.organizationId;

        if (typeof organizationId !== "string") {
            return res.status(400).json({
                status: "error",
                message: "Invalid organization ID",
            });
        }

        await leaveOrganization(
            organizationId,
            req.user.userId
        );

        return res.status(200).json({
            status: "success",
            message:
                "You have left the organization successfully",
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message ===
                "You are not a member of this organization"
        ) {
            return res.status(404).json({
                status: "error",
                message: error.message,
            });
        }

        if (
            error instanceof Error &&
            error.message ===
                "The organization owner cannot leave the organization"
        ) {
            return res.status(403).json({
                status: "error",
                message: error.message,
            });
        }

        console.error(error);

        return res.status(500).json({
            status: "error",
            message:
                "Failed to leave the organization",
        });
    }
}