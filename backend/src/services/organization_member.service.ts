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

export async function updateOrganizationMemberRole(
    organizationId: string,
    memberId: string,
    role: "ADMIN" | "MEMBER"
) {
    const membership =
        await prisma.organizationMember.findFirst({
            where: {
                id: memberId,
                organizationId,
            },
        });

    if (!membership) {
        throw new Error("Member not found");
    }

    if (membership.role === "OWNER") {
        throw new Error(
            "The organization owner role cannot be changed"
        );
    }

    return prisma.organizationMember.update({
        where: {
            id: memberId,
        },
        data: {
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
}

export async function removeOrganizationMember(
    organizationId: string,
    memberId: string
) {
    const membership =
        await prisma.organizationMember.findFirst({
            where: {
                id: memberId,
                organizationId,
            },
        });

    if (!membership) {
        throw new Error("Member not found");
    }

    if (membership.role === "OWNER") {
        throw new Error(
            "The organization owner cannot be removed"
        );
    }

    return prisma.organizationMember.delete({
        where: {
            id: memberId,
        },
    });
}

export async function leaveOrganization(
    organizationId: string,
    userId: string
) {
    const membership =
        await prisma.organizationMember.findUnique({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId,
                },
            },
        });

    if (!membership) {
        throw new Error(
            "You are not a member of this organization"
        );
    }

    if (membership.role === "OWNER") {
        throw new Error(
            "The organization owner cannot leave the organization"
        );
    }

    await prisma.organizationMember.delete({
        where: {
            id: membership.id,
        },
    });
}