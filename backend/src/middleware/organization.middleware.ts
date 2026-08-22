import type { NextFunction, Response } from "express";
import { prisma } from "../config/database.js";
import type { AuthenticatedRequest } from "./auth.middleware.js";

export type OrganizationRole = "OWNER" | "ADMIN" | "MEMBER";

export interface OrganizationRequest extends AuthenticatedRequest {
    organization?: {
        id: string;
        role: OrganizationRole;
    };
}

export function requireOrganizationRole(
    allowedRoles: OrganizationRole[]
) {
    return async (
        req: OrganizationRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    status: "error",
                    message: "Authentication required",
                });
            }

            const organizationId = req.params.organizationId;

            if (typeof organizationId !== "string") {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid organization ID",
                });
            }

            const membership = await prisma.organizationMember.findUnique({
                where: {
                    userId_organizationId: {
                        userId: req.user.userId,
                        organizationId,
                    },
                },
            });

            if (!membership) {
                return res.status(403).json({
                    status: "error",
                    message: "You are not a member of this organization",
                });
            }

            if (!allowedRoles.includes(membership.role)) {
                return res.status(403).json({
                    status: "error",
                    message: "You do not have permission to perform this action",
                });
            }

            req.organization = {
                id: organizationId,
                role: membership.role,
            };

            next();
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: "Failed to verify organization permissions"
            })
        }
    };
}