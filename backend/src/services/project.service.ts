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