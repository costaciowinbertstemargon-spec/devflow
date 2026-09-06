import "dotenv/config";
import type { SignOptions } from "jsonwebtoken";

const requiredEnvVariables = [
    "DATABASE_URL",
    "JWT_SECRET",
];

for (const variable of requiredEnvVariables) {
    if (!process.env[variable]) {
        throw new Error(
            `Missing required environment variable: ${variable}`
        );
    }
}

const jwtExpirationIn =
    (process.env.JWT_EXPIRES_IN || "1h") as NonNullable<
        SignOptions["expiresIn"]
    >;

export const env = {
    databaseUrl: process.env.DATABASE_URL!,
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpirationIn,
    port: Number(process.env.PORT) || 5000,
    nodeEnv: process.env.NODE_ENV || "development",
    frontendUrl:
        process.env.FRONTEND_URL || "http://localhost:3000",
};