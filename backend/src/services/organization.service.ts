import { prisma } from "../config/database.js";

interface CreateOrganizationInput {
    name: string;
    description?: string;
}

export async function createOrganization(
    input: CreateOrganizationInput,
    userId: string
) {
    const organization = await prisma.organization.create({
        data: {
            name: input.name,
            ...(input.description !== undefined && {
                description: input.description
            }),

            members: {
                create: {
                    userId,
                    role: "OWNER"
                },
            },
        },

        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });

    return organization;
}