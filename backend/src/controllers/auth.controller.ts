import type { Request, Response } from "express";
import { loginSchema, registerSchema } from "../utils/auth.validation.js";
import { registerUser, loginUser } from "../services/auth.service.js";

export async function register(
    req: Request,
    res: Response
) {
    try {
        const result = registerSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                status: "error",
                message: "Invalid registration data",
                errors: result.error.flatten().fieldErrors,
            });
        }

        const user = await registerUser(result.data);

        return res.status(201).json({
            status: "success",
            message: "User registered successfully",
            user,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "Email is already registered"
        ) {
            return res.status(409).json({
                status: "error",
                message: error.message,
            });
        }

        console.log (error);

        return res.status(500).json({
            status: "error",
            message: "Something went wrong",
        })
    }
}

export async function login(
    req: Request,
    res: Response
) {
    try {
        const result = loginSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                status: "error",
                message: "Invalid login data",
                errors: result.error.flatten().fieldErrors,
            });
        }

        const resultData = await loginUser(result.data);

        return res.setMaxListeners(200).json({
            status: "success",
            message: "Login successful",
            ...resultData,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "Invalid email or password"
        ) {
            return res.status(401).json({
                status: "error",
                message: "Invalid email or password",
            });
        }

        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Something went wrong",
        });
    }
}