import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Auth API", () => {
    it("should reject invalid registration data", async () => {
        const response = await request(app)
        .post("/api/auth/register")
        .send({
            name: "",
            email: "not-an-email",
            password: "123",
        });

        expect(response.status).toBe(400);
        expect(response.body.status).toBe("error");
        expect(response.body.message).toBe("Validation failed");
    });

    it("should register a new user successfully", async () => {
        const uniqueEmail = `test-${Date.now()}@example.com`;

        const response = await request(app)
            .post("/api/auth/register")
            .send({
            name: "Test User",
            email: uniqueEmail,
            password: "password123",
            });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe("success");
    });

    it("should reject duplicate email registration", async () => {
        const email = `duplicate-${Date.now()}@example.com`;

        const firstResponse = await request(app)
            .post("/api/auth/register")
            .send({
            name: "First User",
            email,
            password: "password123",
            });

        expect(firstResponse.status).toBe(201);

        const secondResponse = await request(app)
            .post("/api/auth/register")
            .send({
            name: "Second User",
            email,
            password: "password123",
            });

        expect(secondResponse.status).toBe(409);
        expect(secondResponse.body.status).toBe("error");
    });

    it("should login a registered user successfully", async () => {
        const email = `login-${Date.now()}@example.com`;
        const password = "password123";

        // Register the user first
        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send({
            name: "Login Test User",
            email,
            password,
            });

        expect(registerResponse.status).toBe(201);

        // Login
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body.status).toBe("success");
        expect(loginResponse.body).toHaveProperty("token");
    });

    it("should reject login with incorrect password", async () => {
        const email = `wrong-password-${Date.now()}@example.com`;
        const password = "password123";

        // Register the user
        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send({
            name: "Wrong Password User",
            email,
            password,
            });

        expect(registerResponse.status).toBe(201);

        // Try to login with the wrong password
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password: "wrongpassword",
            });

        expect(loginResponse.status).toBe(401);
        expect(loginResponse.body.status).toBe("error");
    });
});