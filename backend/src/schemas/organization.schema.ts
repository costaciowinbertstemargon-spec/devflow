import { z } from "zod";

export const createOrganizationSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Organization name is required")
        .max(100, "Organization name is too long"),

    description: z
        .string()
        .trim()
        .max(500, "Organization description is too long")
        .optional(),
});

export const addMemberSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Invalid email address"),

    role: z
        .enum(["ADMIN", "MEMBER"]),
});