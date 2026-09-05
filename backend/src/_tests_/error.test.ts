import express from "express";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import { errorHandler } from "../middleware/error.middleware.js";
import app from "../app.js";

describe("Error Handler", () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it("should return a generic 500 response for unknown errors", async () => {
        const testApp = express();

        testApp.get("/test-error", () => {
            throw new Error("Sensitive internal database error");
        });

        testApp.use(errorHandler);

        const response = await request(testApp)
            .get("/test-error");

        expect(response.status).toBe(500);
        expect(response.body.status).toBe("error");
        expect(response.body.message).toBe("Internal Server Error");
        
        expect(response.body.message).not.toContain(
            "Sensitive internal database error"
        );
    });

    it("should return a JSON 404 for an unknown route", async () => {
        const response = await request(app)
            .get("/api/this-route-does-not-exist");
        
        expect(response.status).toBe(404);
        expect(response.body.status).toBe("error");
        expect(response.body.message).toBe("Route not found");
    });
});