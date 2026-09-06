import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}

export function authenticate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    try{
        const authHeader = req.headers.authorization;
        

        if (!authHeader) {
            return res.status(401).json({
                status: "error",
                message: "Authentication required",
            });
        }

        const [scheme, token] = authHeader.split(" ");

        if (scheme !== "Bearer" || !token) {
            return res.status(401).json({
                status: "error",
                message: "Invalid authorization format",
            });
        }

        const decoded = jwt.verify(
            token,
            env.jwtSecret,
            {
                algorithms: ["HS256"],
            }
        );

        if (typeof decoded !== "object" || !decoded) {
            return res.status(401).json({
                status: "error",
                message: "Invalid token",
            });
        }

        const { userId, email } = decoded as {
            userId?: string;
            email?: string;
        };

        if ( !userId || !email ) {
            return res.status(401).json({
                status: "error",
                message: "Invalid token",
            });
        }

        req.user = {
            userId,
            email,
        };

        next();
    } catch (error) {
        console.error("Authentication error:", error);

        return res.status(401).json({
            status: "error",
            message: "Invalid or expired token",
        });
    }
}