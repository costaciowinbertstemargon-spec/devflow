import { z } from "zod";

export const createProjectSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Project name is required")
        .max(150, "Project name is too long"),

    description: z
        .string()
        .trim()
        .max(1000, "Project description is too long")
        .optional(),
});