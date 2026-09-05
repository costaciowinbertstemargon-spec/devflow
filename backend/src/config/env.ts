import "dotenv/config";

const requiredEnvVariables = [
    "DATABASE_URL",
    "JWT_SECRET",
];

for (const variable of requiredEnvVariables) {
    if (!process.env[variable]) {
        throw new Error(`Missing required environment variable: ${variable}`);
    };
}

export const env = {
    databaseUrl: process.env.DATABASE_URL!,
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpirationIn: process.env.JWT_EXPIRATION_IN || "1h",
    port: Number(process.env.PORT) || 5000,
    nodeEnv: process.env.NODE_ENV || "development",
};