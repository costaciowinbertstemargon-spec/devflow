import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { prisma } from "../config/database.js";
import type { RegisterInput, LoginInput } from "../utils/auth.validation.js";
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