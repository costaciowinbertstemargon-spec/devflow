import { prisma } from "../config/database.js";

export async function addOrganizationMember(
    organizationId: string,
    email: string,
    role: "ADMIN" | "MEMBER"
) {

    // Check if organization exists
    const organization = await prisma.organization.findUnique ({
        where: {
            id : organizationId,
        },
    });

    // Find the user
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    //Check if the user is already a member
    const existingMember = await prisma.organizationMember.findUnique({
        where: {
            userId_organizationId: {
                userId: user.id,
                organizationId,
            },
        },
    });

    if (existingMember) {
        throw new Error("User is already a member");
    }

    // Add the user
    const membership = await prisma.organizationMember.create({
        data: {
            userId: user.id,
            organizationId,
            role,
        },
        include: {
            user: {
                select: { 
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    return membership;
}