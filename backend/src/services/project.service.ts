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