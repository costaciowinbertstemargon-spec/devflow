import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { prisma } from "../config/database.js";
import type { RegisterInput, LoginInput, UpdateProfileInput } from "../utils/auth.validation.js";
import { env } from "../config/env.js";

export async function registerUser(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
        where: {
            email: input.email
        },
    });

    if (existingUser) {
        throw new Error("Email is already registered");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await prisma.user.create({
        data: {
            name: input.name,
            email: input.email,
            passwordHash,
        },
    });

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
    };
}

export async function loginUser(input: LoginInput) {
    const user = await prisma.user.findUnique({
        where: {
            email: input.email,
        },
    });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(
        input.password,
        user.passwordHash
    );

    if (!passwordMatches) {
        throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
        {
            userId: user.id,
            email: user.email,
        },
        env.jwtSecret,
        {
            expiresIn: env.jwtExpirationIn,
            algorithm: "HS256",
        }
    );

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
        },
    };
}

export async function updateUserProfile(
    userId: string,
    input: UpdateProfileInput
) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (
        input.name === undefined &&
        input.email === undefined &&
        input.newPassword === undefined
    ) {
        throw new Error("No changes provided");
    }

    const passwordChanged =
        input.newPassword !== undefined;

    if (
        input.email !== undefined &&
        input.email !== user.email
    ) {
        if (!input.currentPassword) {
            throw new Error(
                "Current password is required to change your email"
            );
        }

        const passwordMatches = await bcrypt.compare(
            input.currentPassword,
            user.passwordHash
        );

        if (!passwordMatches) {
            throw new Error("Current password is incorrect");
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email: input.email,
            },
        });

        if (existingUser && existingUser.id !== userId) {
            throw new Error("Email is already registered");
        }
    }

    if (passwordChanged) {
        if (!input.currentPassword) {
            throw new Error(
                "Current password is required to change your password"
            );
        }

        const passwordMatches = await bcrypt.compare(
            input.currentPassword,
            user.passwordHash
        );

        if (!passwordMatches) {
            throw new Error("Current password is incorrect");
        }
    }

    let passwordHash: string | undefined;

    if (passwordChanged) {
        passwordHash = await bcrypt.hash(
            input.newPassword as string,
            12
        );
    }

    const updatedUser = await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            ...(input.name !== undefined && {
                name: input.name,
            }),

            ...(input.email !== undefined && {
                email: input.email,
            }),

            ...(passwordHash !== undefined && {
                passwordHash,
            }),
        },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return updatedUser;
}