import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Health API", () => {
    it("should return a healthy API and connected database", async () => {
        const response = await request(app)
        .get("/api/health");

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("success");
        expect(response.body.message).toBe("DevFlow API is healthy");
        expect(response.body.database).toBe("connected");
    });

    it("should connect to the database through prisma", async () => {
        const { prisma } = await import("../config/database.js");

        const result = await prisma.$queryRaw<{ result: number }[]>`SELECT 1 AS result`;


        expect(result).toHaveLength(1);
        expect(result[0]?.result).toBe(1);
    });
});