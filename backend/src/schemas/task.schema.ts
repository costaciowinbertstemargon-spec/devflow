import { z } from "zod";

export const createTaskSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, "Task title is required"),

    description: z
        .string()
        .trim()
        .optional(),

    priority: z
        .enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
        .optional(),

    dueDate: z
        .string()
        .datetime()
        .optional(),

    assigneeId: z
        .uuid()
        .optional(),
});

export const updateTaskSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1)
        .optional(),

    description: z
        .string()
        .trim()
        .nullable()
        .optional(),

    status: z
        .enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"])
        .optional(),

    priority: z
        .enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
        .optional(),

    dueDate: z
        .string()
        .datetime()
        .nullable()
        .optional(),

    assigneeId: z
        .uuid()
        .nullable()
        .optional(),
});
