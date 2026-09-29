import { prisma } from "../config/database.js";

interface CreateProjectInput {
    name: string;
    description?: string;
}

export async function createProject(
    organizationId: string,
    input: CreateProjectInput
) {
    const project = await prisma.project.create({
        data: {
            name: input.name,
            ...(input.description !== undefined && {
                description: input.description,
            }),
            organizationId,
        },
    });

    return project;
}

export async function getProjectByOrganization(
    organizationId: string
) {
    return prisma.project.findMany({
        where: {
            organizationId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function getProjectById(
    projectId: string
) {
    return prisma.project.findUnique({
        where: {
            id: projectId,
        },
        include: {
            organization: true,
        },
    });  
}

export async function updateProject(
    projectId: string,
    userId: string,
    input: {
        name: string;
        description?: string;
    }
) {
    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
    });

    if (!project) {
        throw new Error("Project not found");
    }

    const membership =
        await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId:
                        project.organizationId,
                },
            },
        });

    if (!membership) {
        throw new Error(
            "You are not a member of this organization"
        );
    }

    if (
        membership.role !== "OWNER" &&
        membership.role !== "ADMIN"
    ) {
        throw new Error(
            "You do not have permission to edit this project"
        );
    }

    return prisma.project.update({
        where: {
            id: projectId,
        },
        data: {
            name: input.name.trim(),
            description:
                input.description?.trim() || null,
        },
    });
}