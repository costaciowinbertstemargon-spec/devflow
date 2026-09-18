import { z } from "zod";

export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name is too long"),

    email: z
        .string()
        .trim()
        .email("Invalid email address"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password is too long"),
});

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Invalid email address"),

    password: z
        .string()
        .min(1, "Password is required"),
});

export const updateProfileSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(2, "Name must be at least 2 characters")
            .max(100, "Name is too long")
            .optional(),

        email: z
            .string()
            .trim()
            .email("Invalid email address")
            .optional(),

        currentPassword: z
            .string()
            .min(1, "Current password is required")
            .optional(),

        newPassword: z
            .string()
            .min(8, "New password must be at least 8 characters")
            .max(100, "New password is too long")
            .optional(),
    })
    .refine(
        (data) => {
            if (data.newPassword && !data.currentPassword) {
                return false;
            }

            return true;
        },
        {
            message: "Current password is required to change your password",
            path: ["currentPassword"],
        }
    );