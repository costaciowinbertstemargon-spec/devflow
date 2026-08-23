import type { Response } from "express";
import { prisma } from "../config/database.js";
import type { OrganizationRequest } from "../middleware/organization.middleware.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { createProject, getProjectByOrganization, getProjectById } from "../services/project.service.js";

export async function createProjectController(
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

        if (!name || typeof name !== "string") {
            return res.status(400).json({
                status: "error",
                message: "Project name is required",
            });
        }

        const project = await createProject(
            req.organization.id,
            {
                name,
                description,
            }
        );

        return res.status(201).json({
            status: "success",
            message: "Project created successfully",
            project,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Failed to create project",
        });
    }
}

export async function getProjects(
    req: OrganizationRequest,
    res: Response
) {
    try {
        if (!req.organization) {
            return res.status(403).json({
                status: "error",
                message: "Organization acess required",
            });
        }

        const projects = await getProjectByOrganization(
            req.organization.id
        );

        return res.status(200).json({
            status: "success",
            projects,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Failed to retrieve projects",
        });
    }
}

export async function getProject(
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

        const projectId = req.params.projectId;

        if (typeof projectId !== "string") {
            return res.status(400).json({
                status: "error",
                message: "Invalid Project ID",
            });
        }

        const project = await getProjectById(projectId);

        if (!project) {
            return res.status(404).json({
                status: "error",
                message: "Project not found",
            });
        }

        const membership =
            await prisma.organizationMember.findUnique({
                where: {
                    userId_organizationId: {
                        userId: req.user.userId,
                    organizationId: project.organizationId,                    
                    },
                },
            });
        
        if (!membership) {
            return res.status(403).json({
                status: "error",
                message: "You do not have access to this project",
            })
        }

        return res.status(200).json({
            status: "success",
            project,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Failed to retrieve project",
        });
    }
}