import type { Response } from "express";
import type { OrganizationRequest } from "../middleware/organization.middleware.js";
import { createProject } from "../services/project.service.js";

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