import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

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

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            console.error("JWT_SECRET is not configured");

            return res.status(500).json({
                status: "error",
                message: "Server configuration error",
            });
        }

        const decoded = jwt.verify(token,secret);

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